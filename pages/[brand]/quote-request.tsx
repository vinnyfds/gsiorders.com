import { GetServerSideProps } from 'next';
import React from 'react';
import QuoteRequestForm from '../../src/components/QuoteRequestForm';

interface QuoteRequestPageProps {
    brandSlug: string;
}

const QuoteRequestPage: React.FC<QuoteRequestPageProps> = ({ brandSlug }) => {
    return (
        <main className="min-h-screen bg-gray-50 py-10" data-brand={brandSlug}>
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="heading-2 text-center mb-8 text-brand-primary">Request a B2B Quote</h1>
                <QuoteRequestForm brandSlug={brandSlug} />
            </div>
        </main>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const brandSlug = context.params?.brand as string;
    // Optionally: validate brandSlug exists in DB, else return 404
    return { props: { brandSlug } };
};

export default QuoteRequestPage; 