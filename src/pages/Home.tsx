import { Link, Outlet, useNavigate } from 'react-router-dom';
import { JWTStorageType } from '../Services/JWTStorage';
import { FC, useEffect, useState } from 'react';
import { DriverServiceType } from '../Services/DriverService';
import { DriverStatus } from '../models/Driver';
import {
	Box,
	Typography,
	Button,
	List,
	ListItemButton,
	ListItemText,
	Toolbar,
	AppBar,
	Drawer,
	Divider,
} from '@mui/material';

interface IProps {
	jwtService: JWTStorageType;
	driverService: DriverServiceType;
}

const HomePage: FC<IProps> = (props) => {
	const [userRole, setUserRole] = useState('');
	const [userMail, setUserMail] = useState('');
	const [driverStatus, setDriverStatus] = useState<DriverStatus>();
	const navigate = useNavigate();

	const handleLogout = () => {
		props.jwtService.removeJWT();
		navigate('/login');
	};

	useEffect(() => {
		const token = props.jwtService.getJWT();
		if (token !== null) {
			const decoded = props.jwtService.decodeJWT(token.token);
			if (decoded) {
				setUserRole(decoded.role);
				setUserMail(decoded.email);
			}
		}
	}, [props.jwtService]);

	useEffect(() => {
		if (userRole === 'DRIVER') {
			const fetchRides = async () => {
				const data = await props.driverService.GetDriverStatus(
					userMail
				);
				setDriverStatus(data);
			};

			fetchRides();
		}
	}, [props.driverService, userMail, userRole]);

	return (
		<Box sx={{ display: 'flex' }}>
			<Drawer
				variant='permanent'
				sx={{
					width: 240,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: 240,
						boxSizing: 'border-box',
					},
				}}
			>
				<Toolbar />
				<Divider />
				<List>
					<ListItemButton component={Link} to='/profile'>
						<ListItemText primary='Profile' />
					</ListItemButton>
					{userRole === 'CLIENT' && (
						<>
							<ListItemButton component={Link} to='/new-ride'>
								<ListItemText primary='New ride' />
							</ListItemButton>
							<ListItemButton
								component={Link}
								to='/previous-rides-user'
							>
								<ListItemText primary='Previous rides' />
							</ListItemButton>
						</>
					)}
					{userRole === 'ADMIN' && (
						<>
							<ListItemButton component={Link} to='/verification'>
								<ListItemText primary='Verification' />
							</ListItemButton>
							<ListItemButton component={Link} to='/all-rides'>
								<ListItemText primary='All rides' />
							</ListItemButton>
						</>
					)}
					{userRole === 'DRIVER' && (
						<>
							<ListItemButton component={Link} to='/new-rides'>
								<ListItemText primary='New rides' />
							</ListItemButton>
							<ListItemButton component={Link} to='/my-rides'>
								<ListItemText primary='My rides' />
							</ListItemButton>
						</>
					)}
				</List>
			</Drawer>
			<Box component='main' sx={{ flexGrow: 1, p: 3 }}>
				<AppBar
					position='fixed'
					sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
				>
					<Toolbar>
						<Typography variant='h6' noWrap sx={{ flexGrow: 1 }}>
							Dashboard
						</Typography>
						{userRole === 'DRIVER' && (
							<Typography variant='body1' sx={{ marginRight: 2 }}>
								{driverStatus === DriverStatus.NOT_VERIFIED
									? 'Driver is not verified'
									: driverStatus === DriverStatus.VERIFIED
									? 'Driver is verified'
									: driverStatus === DriverStatus.BANNED
									? 'Driver is banned'
									: 'Unknown status'}
							</Typography>
						)}
						<Button color='inherit' onClick={handleLogout}>
							Logout
						</Button>
					</Toolbar>
				</AppBar>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
};

export default HomePage;
