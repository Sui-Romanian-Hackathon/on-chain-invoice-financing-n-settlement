module invoice_financing::escrow;

use invoice_financing::invoice::{Invoice, buyer};
use sui::coin::Coin;
use sui::sui::SUI;
use sui::balance::{Balance, zero};

#[error]
const E_NOT_BUYER: vector<u8> = b"Caller is not the invoice buyer";

#[error]
const E_WRONG_INVOICE: vector<u8> = b"Escrow does not belong to the specified invoice";

public struct BuyerEscrow has key, store {
    id: UID,
    invoice_id: ID,
    buyer: address,
    escrow_amount: u64,
    paid: bool,
    escrow: Balance<SUI>,
}

public fun create_escrow_internal(
    invoice_id: ID,
    buyer: address,
    escrow_amount: u64,
    ctx: &mut TxContext,
): BuyerEscrow {
    
    BuyerEscrow {
        id: object::new(ctx),
        invoice_id,
        buyer,
        escrow_amount,
        paid: false,
        escrow: zero<SUI>(),
    }
}

entry fun pay_escrow(invoice: &mut Invoice, buyer_escrow: &mut BuyerEscrow, payment: Coin<SUI>, ctx: &TxContext) {
    let sender = ctx.sender();

    // -------------------------------------------
    // 1. Caller must be the invoice buyer
    // -------------------------------------------
    assert!(
        sender == buyer(invoice),
        E_NOT_BUYER
    );

    assert!(
        buyer_escrow.invoice_id == object::id(invoice
        ),
        E_WRONG_INVOICE
    );

    let _payment_amount = payment.balance().value();
    let balance = payment.into_balance();
    sui::balance::join(&mut buyer_escrow.escrow, balance);
    buyer_escrow.paid = true;
}
