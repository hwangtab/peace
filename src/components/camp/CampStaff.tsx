import React from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import { StaffSection } from '@/types/camp';

interface CampStaffProps {
  staff: StaffSection[];
  collaborators?: string[];
}

const CampStaff: React.FC<CampStaffProps> = ({ staff, collaborators }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Staff sections */}
      <div className="space-y-3">
        {staff.map((section, index) => (
          <motion.div
            key={`${section.role}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex items-start gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-coastal-gray mt-2 flex-shrink-0" />
            <p className="font-serif font-bold text-base min-w-0">
              <span className="text-coastal-gray">{section.role}:</span>
              <span className="text-coastal-gray/70 ms-2 break-words">
                {section.members.join(', ')}
              </span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Collaborators section */}
      {collaborators && collaborators.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="pt-4 border-t border-ocean-sand"
        >
          <h4 className="font-serif font-bold text-base text-coastal-gray mb-3">
            {t('camp.section_collaborators')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {collaborators.map((org, index) => (
              <motion.div
                key={org}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="flex items-center gap-2"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-coastal-gray flex-shrink-0" />
                <span className="font-serif font-bold text-sm text-coastal-gray break-words">
                  {org}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CampStaff;
