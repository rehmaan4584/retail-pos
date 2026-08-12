export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    customer: { name: string; phone: string };
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
}

/** What the client may send — server ignores money fields and recalculates. */
export interface CheckoutRequestBody {
    customer?: { name?: string; phone?: string };
    items?: Array<{ id?: number; quantity?: number }>;
    subtotal?: number;
    tax?: number;
    total?: number;
}

export type CheckoutSuccessResponse = {
    success: true;
    order: Order;
    message: string;
};

export type CheckoutErrorResponse = {
    success: false;
    error: string;
};

export type CheckoutResponse = CheckoutSuccessResponse | CheckoutErrorResponse;