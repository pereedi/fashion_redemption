import React from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';

interface Review {
    id: number | string;
    user: string;
    rating: number;
    date: string;
    comment: string;
    images?: string[];
    avatar?: string;
}

interface ReviewSectionProps {
    rating: number;
    reviewCount: number;
    reviews: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ rating, reviewCount, reviews }) => {
    return (
        <div className="py-20 border-t border-black/10">
            <div className="mb-12">
                <h2 className="text-3xl font-serif uppercase mb-4">CUSTOMER REVIEWS</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-4xl font-serif font-bold">{rating}</span>
                        <div className="flex text-luxury-red">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
                            ))}
                        </div>
                    </div>
                    <span className="text-xs font-bold tracking-widest text-black/40 uppercase">
                        BASED ON {reviewCount} REVIEWS
                    </span>
                </div>
                <button className="text-[10px] font-bold tracking-widest uppercase border-b border-black pb-1 mt-6 hover:text-luxury-red hover:border-luxury-red transition-all">
                    WRITE A REVIEW
                </button>
            </div>

            <div className="space-y-12">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;
