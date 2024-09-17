import { FC, useEffect, useState } from 'react';
import { DriverServiceType } from '../Services/DriverService';
import { Driver, DriverStatus, UpdateDriverStatusData } from '../models/Driver';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Typography,
	Paper,
} from '@mui/material';

interface IProps {
	driverService: DriverServiceType;
}

const Verification: FC<IProps> = (props) => {
	const [driversData, setDriversData] = useState<Driver[]>([]);

	useEffect(() => {
		const fetchDrivers = async () => {
			const data = await props.driverService.GetAllDrivers();
			if (data) {
				const driversWithRatings = await Promise.all(
					data.map(async (driver) => {
						const rating =
							await props.driverService.GetDriverRating(
								driver.email
							);
						return { ...driver, rating };
					})
				);
				setDriversData(driversWithRatings);
			}
		};
		fetchDrivers();
	}, [props.driverService]);

	const handleVerify = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.VERIFIED, 'verified');
	};

	const handleBan = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.BANNED, 'banned');
	};

	const handleUnban = (driver: Driver) => {
		updateDriverStatus(driver, DriverStatus.VERIFIED, 'unbanned');
	};

	async function updateDriverStatus(
		driver: Driver,
		status: DriverStatus,
		action: string
	) {
		const request: UpdateDriverStatusData = {
			Email: driver.email,
			Status: status,
		};

		try {
			const response = await props.driverService.UpdateDriverStatus(
				request
			);

			if (response && response.status === 200) {
				alert(
					`Driver ${driver.username} has been ${action} successfully.`
				);
				const data = await props.driverService.GetAllDrivers();
				if (data) {
					setDriversData(data);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<Box sx={{ padding: 2 }}>
			<Typography variant='h4' gutterBottom>
				Driver Verification
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Username</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Full Name</TableCell>
							<TableCell>Date of Birth</TableCell>
							<TableCell>Address</TableCell>
							<TableCell>Rating</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{driversData.map((driver) => (
							<TableRow key={driver.username}>
								<TableCell>{driver.username}</TableCell>
								<TableCell>{driver.email}</TableCell>
								<TableCell>{driver.fullname}</TableCell>
								<TableCell>{driver.dateOfBirth}</TableCell>
								<TableCell>{driver.address}</TableCell>
								<TableCell>
									{driver.rating === 0
										? 'N/A'
										: driver.rating}
								</TableCell>
								<TableCell>{driver.status}</TableCell>
								<TableCell>
									{driver.status ===
										DriverStatus.NOT_VERIFIED && (
										<Button
											variant='contained'
											color='primary'
											onClick={() => handleVerify(driver)}
										>
											Verify
										</Button>
									)}
									{driver.status ===
										DriverStatus.VERIFIED && (
										<Button
											variant='contained'
											color='secondary'
											onClick={() => handleBan(driver)}
										>
											Ban
										</Button>
									)}
									{driver.status === DriverStatus.BANNED && (
										<Button
											variant='contained'
											color='success'
											onClick={() => handleUnban(driver)}
										>
											Unban
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default Verification;
