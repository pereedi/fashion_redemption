import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number | string;
  user: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  avatar?: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
      <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-2">
        <div className="w-12 h-12 rounded-full bg-luxury-red/10 flex items-center justify-center text-luxury-red font-bold">
          {review.avatar || review.user[0]}
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight">{review.user}</h4>
          <div className="flex text-luxury-red mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-black/40 font-bold uppercase">{review.date}</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-black/70 leading-relaxed font-medium mb-6">
          "{review.comment}"
        </p>
        {review.images && review.images.length > 0 && (
          <div className="flex gap-4">
            {review.images.map((img, i) => (
              <div key={i} className="w-20 h-20 overflow-hidden bg-light-gray">
                <img 
                  src={img} 
                  alt="Review" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all cursor-zoom-in" 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
