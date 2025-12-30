import React from 'react';
import { motion } from 'framer-motion';
import { StaffSection } from '../../types/camp';

interface CampStaffProps {
    staff: StaffSection[];
    collaborators?: string[];
    inView: boolean;
}

const CampStaff: React.FC<CampStaffProps> = ({ staff, collaborators, inView }) => {
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
                        <span className="inline-block w-2 h-2 rounded-full bg-jeju-ocean mt-2 flex-shrink-0" />
                        <p className="typo-body">
                            <span className="font-medium text-jeju-ocean">{section.role}:</span>{' '}
                            <span className="text-coastal-gray">{section.members.join(', ')}</span>
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
                    <h4 className="typo-h3 !text-lg text-jeju-ocean mb-3">협력</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {collaborators.map((org, index) => (
                            <motion.div
                                key={org}
                                initial={{ opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{ duration: 0.4, delay: 0.4 + staff.length * 0.05 + index * 0.03 }}
                                className="flex items-center gap-2"
                            >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ocean-mist flex-shrink-0" />
                                <span className="typo-body !text-sm text-coastal-gray">{org}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CampStaff;
