import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { StaffSection } from '../../types/camp';

interface CampStaffProps {
    staff: StaffSection[];
    collaborators?: string[];
    inView: boolean;
}

const CampStaff: React.FC<CampStaffProps> = ({ staff, collaborators, inView }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            {/* Staff sections */}
            <div className="space-y-3">
                {staff.map((section, index) => (
                    <motion.div
                        key={section.role}
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="flex items-start gap-2"
                    >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        <p className="font-serif text-base">
                            <span className="text-gray-700">{section.role}:</span>
                            <span className="text-gray-500 ml-2">{section.members.join(', ')}</span>
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Collaborators section */}
            {collaborators && collaborators.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.3 + staff.length * 0.05 }}
                    className="pt-4 border-t border-gray-100"
                >
                    <h4 className="font-serif text-base text-gray-600 mb-3">{t('camp.section_collaborators')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {collaborators.map((org, index) => (
                            <motion.div
                                key={org}
                                initial={{ opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{ duration: 0.4, delay: 0.4 + staff.length * 0.05 + index * 0.03 }}
                                className="flex items-center gap-2"
                            >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                <span className="font-serif text-sm text-gray-600">{org}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CampStaff;
