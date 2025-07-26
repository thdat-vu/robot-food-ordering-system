export default function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

export const CheckID = (id:string):boolean => {
    return id !== '';
}