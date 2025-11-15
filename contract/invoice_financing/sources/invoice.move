module invoice_financing::invoice;

public struct Invoice has key, store {
    id: UID,

    buyer: address,               // Who must repay
    supplier: address,            // Who issued the invoice

    amount: u64,                  // Principal amount (in SUI for now)
    due_date: u64,                // UNIX timestamp
    companies_info: vector<u8>,   // Encoded metadata (JSON, IPFS, ABI)

    status: u8,                   // 0=Created,1=Ready,2=Financed,3=Paid
    
    escrow_bps: u64,              // Buyer's collateral amount of the total (in BPS)

    discount_bps: u64,            // Discount in BPS (e.g., 200 = 2%)
    fee_bps: u64,                 // Protocol fee taken out of the discount
}

public fun buyer(invoice: &Invoice): address {
    invoice.buyer
}

public(package) fun set_status(invoice: &mut Invoice, new_status: u8) {
    invoice.status = new_status;
}

public fun create_invoice_internal(
    supplier: address,
    buyer: address,
    amount: u64,
    due_date: u64,
    companies_info: vector<u8>,
    escrow_bps: u64,
    discount_bps: u64,
    fee_bps: u64,
    ctx: &mut TxContext,
): Invoice {

    //todo validate params
    
    Invoice {
        id: object::new(ctx),
        buyer,
        supplier,
        amount,
        due_date,
        companies_info,
        status: 0,
        escrow_bps,
        discount_bps,
        fee_bps,
    }
}
