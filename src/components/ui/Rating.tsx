import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface RatingProps {
	onRate?: (rating: number) => void;
}

const Rating: React.FC<RatingProps> = ({ onRate }) => {
	const [rating, setRating] = useState<number>(0);
	const [hover, setHover] = useState<number>(0);

	return (
		<Box sx={{ display: 'flex' }}>
			{[...Array(5)].map((_, index) => {
				const starRating = index + 1;

				return (
					<IconButton
						key={index}
						onClick={() => {
							setRating(starRating);
							if (onRate) onRate(starRating);
						}}
						onMouseEnter={() => setHover(starRating)}
						onMouseLeave={() => setHover(0)}
						color='primary'
					>
						{starRating <= (hover || rating) ? (
							<StarIcon />
						) : (
							<StarBorderIcon />
						)}
					</IconButton>
				);
			})}
		</Box>
	);
};

export default Rating;
