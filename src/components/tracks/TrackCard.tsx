import React from 'react';
import { motion } from 'framer-motion';
import { Track } from '../../types/track';
import AudioPlayer from './AudioPlayer';

export interface TrackCardProps {
    track: Track;
    isExpanded: boolean;
    onToggle: () => void;
    currentlyPlaying: boolean;
    onPlay: () => void;
}

const TrackCard = React.memo(({
    track,
    isExpanded,
    onToggle,
    currentlyPlaying,
    onPlay,
}: TrackCardProps) => {

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
        >
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-ocean-sand transition-colors"
                onClick={() => {
                    onToggle();
                    onPlay();
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); onPlay(); } }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
            >
                <div className="flex justify-between items-center">
                    <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold font-serif">{track.title}</h3>
                            <span className="text-sm text-coastal-gray ml-4">{track.duration}</span>
                        </div>
                        <p className="text-jeju-ocean font-serif">{track.artist}</p>
                    </div>
                    <motion.button
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-coastal-gray ml-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4"
                >
                    {/* Audio Player */}
                    {track.audioUrl && (
                        <div className="mt-4 mb-8">
                            <AudioPlayer
                                audioUrl={track.audioUrl}
                                isPlaying={currentlyPlaying}
                                onPlayPause={onPlay}
                                title={track.title}
                                artist={track.artist}
                            />
                        </div>
                    )}

                    {/* Description */}
                    {track.description && (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <h4 className="text-lg font-serif text-jeju-ocean">곡 설명</h4>
                                <div className="flex-grow ml-4 h-px bg-coastal-gray/20" />
                            </div>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{track.description}</p>
                        </div>
                    )}

                    {/* Lyrics */}
                    {track.lyrics && (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <h4 className="text-lg font-serif text-jeju-ocean">가사</h4>
                                <div className="flex-grow ml-4 h-px bg-coastal-gray/20" />
                            </div>
                            <div className="bg-ocean-sand/30 p-4 rounded-lg">
                                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{track.lyrics}</p>
                            </div>
                        </div>
                    )}

                    {/* Credits */}
                    {track.credits && (
                        <div className="mb-4">
                            <div className="flex items-center mb-4">
                                <h4 className="text-lg font-serif text-jeju-ocean">크레딧</h4>
                                <div className="flex-grow ml-4 h-px bg-coastal-gray/20" />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(track.credits).map(([role, value]) => {
                                    type Performer = { role: string; name: string[] };

                                    const isPerformerArray = (arr: unknown[]): arr is Performer[] => {
                                        return arr.every(item =>
                                            typeof item === 'object' &&
                                            item !== null &&
                                            'role' in item &&
                                            'name' in item &&
                                            Array.isArray(item.name)
                                        );
                                    };

                                    const renderValue = () => {
                                        if (!Array.isArray(value)) return String(value);

                                        if (value.length === 0) return '';

                                        if (isPerformerArray(value)) {
                                            return value.map((performer, idx) => (
                                                <div key={idx}>
                                                    {performer.role}: {performer.name.join(', ')}
                                                </div>
                                            ));
                                        }

                                        return (value as string[]).join(', ');
                                    };

                                    return (
                                        <div key={role} className="flex items-start space-x-2">
                                            <span className="text-sm text-coastal-gray font-medium min-w-[80px]">
                                                {role === 'personnel' ? 'Personnel' : role}
                                            </span>
                                            <span className="text-gray-600">
                                                {renderValue()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
});

export default TrackCard;
