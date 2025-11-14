module invoice_financing::invoice_financing;

public struct Invoice has key {
    id: UID,
    amount: u64,
    owner: address,
}

fun init(_ctx: &mut TxContext) {}

public fun create_invoice(amount: u64, ctx: &mut TxContext): Invoice {
    return Invoice {
        id: object::new(ctx),
        amount,
        owner: tx_context::sender(ctx),
    }
}
