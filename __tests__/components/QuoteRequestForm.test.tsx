import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import QuoteRequestForm from '../../src/components/QuoteRequestForm';

beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe('QuoteRequestForm', () => {
    it('renders all required fields', () => {
        render(<QuoteRequestForm brandSlug="liquidheaven" />);
        expect(screen.getByTestId('company-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('contact-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('phone-input')).toBeInTheDocument();
        expect(screen.getByTestId('item-productId-input-0')).toBeInTheDocument();
        expect(screen.getByTestId('item-quantity-input-0')).toBeInTheDocument();
        expect(screen.getByTestId('notes-input')).toBeInTheDocument();
        expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<QuoteRequestForm brandSlug="liquidheaven" />);
        await act(async () => {
            fireEvent.click(screen.getByTestId('submit-btn'));
        });
        // Log DOM for debugging
        // eslint-disable-next-line no-console
        console.log(document.body.innerHTML);
        // Query all error messages
        await waitFor(() => {
            const errors = Array.from(document.querySelectorAll('.field-error-message')).map(e => e.textContent || '');
            expect(errors.some(e => e.includes('Company name is required'))).toBe(true);
            expect(errors.some(e => e.includes('Contact name is required'))).toBe(true);
            expect(errors.some(e => e.includes('Email is required'))).toBe(true);
            expect(errors.some(e => e.includes('Phone is required'))).toBe(true);
            expect(errors.some(e => e.includes('Product ID required'))).toBe(true);
        });
    });

    it('submits valid data and shows success alert', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 201 });
        render(<QuoteRequestForm brandSlug="liquidheaven" />);
        fireEvent.change(screen.getByTestId('company-name-input'), { target: { value: 'Acme Corp' } });
        fireEvent.change(screen.getByTestId('contact-name-input'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1234567890' } });
        fireEvent.change(screen.getByTestId('item-productId-input-0'), { target: { value: 'prod-123' } });
        fireEvent.change(screen.getByTestId('item-quantity-input-0'), { target: { value: 5 } });
        fireEvent.click(screen.getByTestId('submit-btn'));
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Quote request submitted successfully!');
        });
    });

    it('shows error alert on API error', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 400, json: async () => ({ error: 'Bad request' }) });
        render(<QuoteRequestForm brandSlug="liquidheaven" />);
        fireEvent.change(screen.getByTestId('company-name-input'), { target: { value: 'Acme Corp' } });
        fireEvent.change(screen.getByTestId('contact-name-input'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1234567890' } });
        fireEvent.change(screen.getByTestId('item-productId-input-0'), { target: { value: 'prod-123' } });
        fireEvent.change(screen.getByTestId('item-quantity-input-0'), { target: { value: 5 } });
        fireEvent.click(screen.getByTestId('submit-btn'));
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Bad request');
        });
    });

    it('disables submit button when submitting', async () => {
        let resolveFetch: any;
        global.fetch = jest.fn(() => new Promise(res => { resolveFetch = res; }));
        render(<QuoteRequestForm brandSlug="liquidheaven" />);
        fireEvent.change(screen.getByTestId('company-name-input'), { target: { value: 'Acme Corp' } });
        fireEvent.change(screen.getByTestId('contact-name-input'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1234567890' } });
        fireEvent.change(screen.getByTestId('item-productId-input-0'), { target: { value: 'prod-123' } });
        fireEvent.change(screen.getByTestId('item-quantity-input-0'), { target: { value: 5 } });
        fireEvent.click(screen.getByTestId('submit-btn'));
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
        resolveFetch({ status: 201 });
    });
}); 