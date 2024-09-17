import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface RatingProps {
	onRate?: (rating: number) => void;
}

const Rating: React.FC<RatingProps> = ({ onRate }) => {
	const [rating, setRating] = useState<number>(0);
	const [hover, setHover] = useState<number>(0);

	return (
		<div style={{ display: 'flex' }}>
			{[...Array(5)].map((_, index) => {
				const starRating = index + 1;

				return (
					<Button
						key={index}
						variant='link'
						onClick={() => {
							setRating(starRating);
							if (onRate) onRate(starRating);
						}}
						onMouseEnter={() => setHover(starRating)}
						onMouseLeave={() => setHover(0)}
						style={{
							padding: 0,
							color: 'gold',
							fontSize: '1.5rem',
						}}
					>
						{starRating <= (hover || rating) ? (
							<FaStar />
						) : (
							<FaRegStar />
						)}
					</Button>
				);
			})}
		</div>
	);
};

export default Rating;
