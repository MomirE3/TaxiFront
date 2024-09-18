import { Link, Outlet, useNavigate } from 'react-router-dom';
import { JWTStorageType } from '../Services/JWTStorage';
import { FC, useEffect, useState } from 'react';
import { DriverServiceType } from '../Services/DriverService';
import { DriverStatus } from '../models/Driver';
import { Button, Container, Navbar, Nav } from 'react-bootstrap';

interface IProps {
	jwtService: JWTStorageType;
	driverService: DriverServiceType;
}

const HomePage: FC<IProps> = (props) => {
	const [userRole, setUserRole] = useState('');
	const [userId, setUserId] = useState('');
	const [userRoleId, setUserRoleId] = useState('');
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
				setUserId(decoded.nameidentifier);
				setUserRoleId(decoded.groupsid);
			}
		}
	}, [props.jwtService]);

	useEffect(() => {
		if (userRole === 'DRIVER') {
			const fetchRides = async () => {
				const data = await props.driverService.GetDriverStatus(
					userRoleId
				);
				setDriverStatus(data);
			};

			fetchRides();
		}
	}, [props.driverService, userRoleId, userRole]);

	return (
		<>
			<Navbar bg='dark' variant='dark'>
				<Container>
					<Navbar.Brand>Dashboard</Navbar.Brand>
					<Nav className='me-auto'>
						<Nav.Link as={Link} to='/profile'>
							Profile
						</Nav.Link>
						{userRole === 'CLIENT' && (
							<>
								<Nav.Link as={Link} to='/new-ride'>
									New ride
								</Nav.Link>
								<Nav.Link as={Link} to='/previous-rides-user'>
									Previous rides
								</Nav.Link>
							</>
						)}
						{userRole === 'ADMIN' && (
							<>
								<Nav.Link as={Link} to='/verification'>
									Verification
								</Nav.Link>
								<Nav.Link as={Link} to='/all-rides'>
									All rides
								</Nav.Link>
							</>
						)}
						{userRole === 'DRIVER' && (
							<>
								<Nav.Link as={Link} to='/new-rides'>
									New rides
								</Nav.Link>
								<Nav.Link as={Link} to='/my-rides'>
									My rides
								</Nav.Link>
							</>
						)}
					</Nav>
					<Navbar.Text>
						{userRole === 'DRIVER' && (
							<>
								{driverStatus === DriverStatus.NOT_VERIFIED &&
									'Driver is not verified'}
								{driverStatus === DriverStatus.VERIFIED &&
									'Driver is verified'}
								{driverStatus === DriverStatus.BANNED &&
									'Driver is banned'}
								{driverStatus !== DriverStatus.NOT_VERIFIED &&
									driverStatus !== DriverStatus.VERIFIED &&
									driverStatus !== DriverStatus.BANNED &&
									'Unknown status'}
							</>
						)}
						<Button variant='outline-info' onClick={handleLogout}>
							Logout
						</Button>
					</Navbar.Text>
				</Container>
			</Navbar>
			<Container fluid>
				<Outlet />
			</Container>
		</>
	);
};

export default HomePage;
