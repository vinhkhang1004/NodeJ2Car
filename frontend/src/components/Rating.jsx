import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text, color = '#f97316' }) => {
  return (
    <div className='flex items-center gap-1'>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => (
          <span key={index}>
            {value >= index ? (
              <Star size={16} fill={color} color={color} />
            ) : value >= index - 0.5 ? (
              <StarHalf size={16} fill={color} color={color} />
            ) : (
              <Star size={16} color={color} />
            )}
          </span>
        ))}
      </div>
      {text && <span className='text-xs font-medium text-slate-500 ml-1'>{text}</span>}
    </div>
  );
};

export default Rating;
