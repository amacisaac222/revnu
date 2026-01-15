'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import CampaignWizard from '@/components/send-reminders/campaign-wizard';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  smsConsentGiven: boolean;
  emailConsentGiven: boolean;
  smsConsentMethod?: string | null;
  smsConsentDate?: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountRemaining: number;
  amountDue: number;
  daysPastDue: number;
  dueDate: string;
  status: string;
  customer: Customer;
}

interface SequenceTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: any[];
  _count?: {
    invoices: number;
  };
}

interface Organization {
  id: string;
  businessName: string;
  phone?: string | null;
  email?: string | null;
}

export default function SendRemindersPage() {
  const [loading, setLoading] = useState(true);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [sequences, setSequences] = useState<SequenceTemplate[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, orgRes, sequencesRes] = await Promise.all([
        fetch('/api/invoices?limit=500'),
        fetch('/api/user/organization'),
        fetch('/api/sequences'),
      ]);

      const invoicesData = await invoicesRes.json();
      const orgData = await orgRes.json();
      const sequencesData = await sequencesRes.json();

      setAllInvoices(invoicesData.invoices || []);
      setOrganization(orgData || null);
      setSequences(sequencesData.sequences || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-revnu-green animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center text-revnu-gray py-12">
        <p>Organization not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Launch Message Campaign</h1>
        <p className="text-revnu-gray mt-1">
          Create and launch automated message sequences to collect payments
        </p>
      </div>

      <CampaignWizard
        invoices={allInvoices}
        sequences={sequences}
        organization={organization}
        onRefresh={fetchData}
      />
    </div>
  );
}
