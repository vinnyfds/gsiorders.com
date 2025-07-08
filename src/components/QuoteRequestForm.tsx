import React, { useState } from 'react';

interface QuoteItem {
    productId: string;
    quantity: number;
}

interface QuoteRequestFormProps {
    brandSlug?: string;
}

const initialItem: QuoteItem = { productId: '', quantity: 1 };

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ brandSlug }) => {
    const [companyName, setCompanyName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([{ ...initialItem }]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!contactName.trim()) newErrors.contactName = 'Contact name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = 'Invalid email';
        if (!phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^\+?[0-9\-\s()]{7,}$/.test(phone)) newErrors.phone = 'Invalid phone';
        if (!items.length) newErrors.items = 'At least one item is required';
        items.forEach((item, idx) => {
            if (!item.productId.trim()) newErrors[`item-productId-${idx}`] = 'Product ID required';
            if (!item.quantity || item.quantity < 1) newErrors[`item-quantity-${idx}`] = 'Quantity must be at least 1';
        });
        return newErrors;
    };

    const handleItemChange = (idx: number, field: keyof QuoteItem, value: string | number) => {
        setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleAddItem = () => {
        setItems([...items, { ...initialItem }]);
    };

    const handleRemoveItem = (idx: number) => {
        setItems(items => items.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/quotes/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: companyName,
                    contact_name: contactName,
                    contact_email: email,
                    contact_phone: phone,
                    items: items.map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity
                    })),
                    additional_notes: notes,
                    brand: brandSlug,
                }),
            });
            if (res.status === 201) {
                setCompanyName('');
                setContactName('');
                setEmail('');
                setPhone('');
                setItems([{ ...initialItem }]);
                setNotes('');
                window.alert('Quote request submitted successfully!');
            } else {
                const data = await res.json();
                window.alert(data.message || data.error || 'Failed to submit quote request.');
            }
        } catch (err) {
            window.alert('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 max-w-2xl mx-auto mt-8" data-testid="quote-request-form">
            <h2 className="text-2xl font-bold mb-6 text-brand-primary">Request a B2B Quote</h2>
            <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                    id="companyName"
                    data-testid="company-name-input"
                    className={`input-base ${errors.companyName ? 'input-error' : ''}`}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {errors.companyName && <p className="field-error-message">{errors.companyName}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="contactName" className="block text-sm font-medium mb-1">Contact Name *</label>
                <input
                    id="contactName"
                    data-testid="contact-name-input"
                    className={`input-base ${errors.contactName ? 'input-error' : ''}`}
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {errors.contactName && <p className="field-error-message">{errors.contactName}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                <input
                    id="email"
                    type="email"
                    data-testid="email-input"
                    className={`input-base ${errors.email ? 'input-error' : ''}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {errors.email && <p className="field-error-message">{errors.email}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone *</label>
                <input
                    id="phone"
                    type="tel"
                    data-testid="phone-input"
                    className={`input-base ${errors.phone ? 'input-error' : ''}`}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {errors.phone && <p className="field-error-message">{errors.phone}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quote Items *</label>
                {errors.items && <p className="field-error-message">{errors.items}</p>}
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                            <input
                                type="text"
                                placeholder="Product ID"
                                data-testid={`item-productId-input-${idx}`}
                                className={`input-base w-1/2 ${errors[`item-productId-${idx}`] ? 'input-error' : ''}`}
                                value={item.productId}
                                onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                                disabled={isSubmitting}
                                required
                                aria-label={`Product ID for item ${idx + 1}`}
                            />
                            <input
                                type="number"
                                min={1}
                                data-testid={`item-quantity-input-${idx}`}
                                className={`input-base w-1/4 ${errors[`item-quantity-${idx}`] ? 'input-error' : ''}`}
                                value={item.quantity}
                                onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                disabled={isSubmitting}
                                required
                                aria-label={`Quantity for item ${idx + 1}`}
                            />
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    data-testid={`remove-item-btn-${idx}`}
                                    className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                                    onClick={() => handleRemoveItem(idx)}
                                    disabled={isSubmitting}
                                    aria-label={`Remove item ${idx + 1}`}
                                >Remove</button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    data-testid="add-item-btn"
                    className="mt-2 text-brand-primary hover:underline text-sm font-medium"
                    onClick={handleAddItem}
                    disabled={isSubmitting}
                >+ Add another item</button>
                {items.map((_, idx) => (
                    <React.Fragment key={idx}>
                        {errors[`item-productId-${idx}`] && <p className="field-error-message">{errors[`item-productId-${idx}`]}</p>}
                        {errors[`item-quantity-${idx}`] && <p className="field-error-message">{errors[`item-quantity-${idx}`]}</p>}
                    </React.Fragment>
                ))}
            </div>
            <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                    id="notes"
                    data-testid="notes-input"
                    className="input-base"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                />
            </div>
            <button
                type="submit"
                data-testid="submit-btn"
                className="btn-primary w-full mt-4"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
            >{isSubmitting ? 'Submitting...' : 'Submit Quote Request'}</button>
        </form>
    );
};

export default QuoteRequestForm; 