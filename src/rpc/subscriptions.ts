import {
  Address,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
  Commitment,
} from '@solana/kit';
import {
  poolAccountCodec,
  custodyAccountCodec,
  positionAccountCodec,
  positionRequestAccountCodec,
  borrowPositionAccountCodec,
} from '../codecs/accounts.js';
import type {
  PoolAccount,
  CustodyAccount,
  PositionAccount,
  PositionRequestAccount,
  BorrowPositionAccount,
} from '../types/accounts.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Call this to stop the subscription and clean up. */
export type Unsubscribe = () => void;

// ─── PerpsSubscriptions ───────────────────────────────────────────────────────

/**
 * All watch* methods share the SAME rpcSubscriptions instance passed in from
 * JupiterPerpsClient. @solana/kit multiplexes all of these over a single
 * underlying WebSocket connection automatically — no extra connections are opened.
 */
/** Manages real-time WebSocket subscriptions to on-chain accounts. */
export class PerpsSubscriptions {
  private readonly rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  private readonly commitment: Commitment;

  constructor(
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    commitment: Commitment = 'confirmed',
  ) {
    this.rpcSubscriptions = rpcSubscriptions;
    this.commitment = commitment;
  }

  // ─── Private generic core ──────────────────────────────────────────────────

  /**
   * Opens one account subscription.  When a change notification arrives the raw
   * bytes are decoded through `codec` and `onUpdate` is called with the result.
   * Returns an `Unsubscribe` function — call it to stop watching.
   *
   * Multiplexing note: every call to this method creates ONE additional
   * subscription on the SHARED rpcSubscriptions WebSocket transport.
   * @solana/kit routes each server message to the right subscriber internally.
   */
  private watch<T>(
    address: Address,
    codec: { decode: (data: Uint8Array) => T },
    onUpdate: (account: T) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    const controller = new AbortController();

    // Start the async loop in the background. We don't await here so the
    // caller gets the Unsubscribe handle immediately.
    (async () => {
      try {
        const subscription = await this.rpcSubscriptions
          .accountNotifications(address, {
            commitment: this.commitment,
            encoding: 'base64',
          })
          .subscribe({ abortSignal: controller.signal });

        for await (const notification of subscription) {
          try {
            // @solana/kit returns data as [base64string, 'base64'] when
            // encoding: 'base64' is requested.
            const raw = notification.value.data;
            const bytes: Uint8Array = Array.isArray(raw)
              ? Uint8Array.from(atob(raw[0] as string), (c) => c.charCodeAt(0))
              : (raw as unknown as Uint8Array);

            onUpdate(codec.decode(bytes));
          } catch (e) {
            onError?.(e as Error);
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          onError?.(error as Error);
        }
      }
    })();

    return () => controller.abort();
  }

  // ─── Public typed watch methods ────────────────────────────────────────────

  /**
   * Watch the JLP Pool account.  Called every time aumUsd, fees, or limit
   * changes (typically every few seconds as trades happen).
   *
   * @example
   * const stop = client.subscriptions.watchPool(JLP_POOL_ADDRESS, pool => {
   *   console.log('AUM:', pool.aumUsd);
   * });
   * // later: stop();
   */
  watchPool(
    address: Address,
    onUpdate: (pool: PoolAccount) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.watch(address, poolAccountCodec, onUpdate, onError);
  }

  /**
   * Watch a Custody account (SOL, ETH, BTC, USDC, USDT).  Called every time
   * assets.owned / assets.locked / fundingRateState changes.
   *
   * @example
   * const stop = client.subscriptions.watchCustody(CUSTODY_ADDRESSES.SOL, custody => {
   *   console.log('SOL owned:', custody.assets.owned);
   * });
   */
  watchCustody(
    address: Address,
    onUpdate: (custody: CustodyAccount) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.watch(address, custodyAccountCodec, onUpdate, onError);
  }

  /**
   * Watch a Position account.  Called when sizeUsd, collateralUsd, or
   * cumulativeInterestSnapshot changes (i.e. after every trade or liquidation).
   *
   * @example
   * const stop = client.subscriptions.watchPosition(positionPda, position => {
   *   console.log('size:', position.sizeUsd, 'side:', position.side);
   * });
   */
  watchPosition(
    address: Address,
    onUpdate: (position: PositionAccount) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.watch(address, positionAccountCodec, onUpdate, onError);
  }

  /**
   * Watch a PositionRequest account.  Useful for bots that need to know when
   * a keeper has executed (executed: true) or when the request is closed.
   */
  watchPositionRequest(
    address: Address,
    onUpdate: (request: PositionRequestAccount) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.watch(address, positionRequestAccountCodec, onUpdate, onError);
  }

  /**
   * Watch a BorrowPosition account.  Called when borrowSize or
   * cumulativeCompoundedInterestSnapshot changes.
   */
  watchBorrowPosition(
    address: Address,
    onUpdate: (borrow: BorrowPositionAccount) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.watch(address, borrowPositionAccountCodec, onUpdate, onError);
  }

  /**
   * Watch slot notifications.  Fires on every new slot (~400 ms).
   * Useful for keeping a "last confirmed slot" counter.
   */
  watchSlot(
    onUpdate: (slot: bigint) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    const controller = new AbortController();

    (async () => {
      try {
        const subscription = await this.rpcSubscriptions
          .slotNotifications()
          .subscribe({ abortSignal: controller.signal });

        for await (const notification of subscription) {
          onUpdate(notification.slot);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          onError?.(error as Error);
        }
      }
    })();

    return () => controller.abort();
  }
}

// ─── Legacy config-based factory (kept for backwards compat) ─────────────────

export interface SubscriptionConfig {
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  commitment?: Commitment;
}

export function createPerpsSubscriptions(config: SubscriptionConfig): PerpsSubscriptions {
  return new PerpsSubscriptions(config.rpcSubscriptions, config.commitment);
}
