'use client';

import { useEffect, useState } from 'react';
import LeadForm from './LeadForm';
import type { SiteMessages } from '@/lib/messages';
import { clearLeadCalculationDraft, readLeadCalculationDraft, type LeadCalculationDraft } from '@/lib/lead-prefill';

export default function ContactsLeadCapture({ t }: { t: SiteMessages }) {
  const [draft, setDraft] = useState<LeadCalculationDraft | null>(null);

  useEffect(() => {
    const nextDraft = readLeadCalculationDraft();
    if (nextDraft) {
      setDraft(nextDraft);
      clearLeadCalculationDraft();
    }

    if (window.location.hash === '#contact-form') {
      requestAnimationFrame(() => {
        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  return <LeadForm t={t} initialService={draft?.service} initialMessage={draft?.message} />;
}
