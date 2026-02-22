'use client';

import { useState } from 'react';
import Section from '@/components/Section';
import OrderMugsForm from '@/components/OrderMugsForm';
import MugDesignInfoToggle from '@/components/mug-designer/MugDesignInfoToggle';

type ComplexityLevel = {
  title: string;
  description: string;
};

type Props = {
  complexityLevels: ComplexityLevel[];
  checklist: string[];
};

export default function MugsDesignAndOrderSection({ complexityLevels, checklist }: Props) {
  const [needsDesign, setNeedsDesign] = useState(false);

  return (
    <>
      <Section className="pt-0">
        <div className="card space-y-5 p-6 md:p-8">
          <MugDesignInfoToggle
            complexityLevels={complexityLevels}
            checklist={checklist}
            needsDesign={needsDesign}
            onNeedsDesignChange={setNeedsDesign}
          />
        </div>
      </Section>

      <Section id="mugs-request" className="pt-0 pb-12">
        <OrderMugsForm needsDesign={needsDesign} />
      </Section>
    </>
  );
}
