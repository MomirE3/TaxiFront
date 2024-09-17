import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RoutesNames } from './Routes';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthService } from '../Services/AuthService';
import { JWTStorage } from '../Services/JWTStorage';
import { PrivateRoute } from './PrivateRoute';
import { BlobService } from '../Services/BlobService';
import NewRide from '../pages/NewRide';
import { RideService } from '../Services/RideService';
import NewRidesDriver from '../pages/NewRidesDriver';
import HomePage from '../pages/Home';
import PreviousRidesUser from '../pages/PreviousRidesUser';
import ProfilePage from '../pages/Profile';
import Verification from '../pages/Verification';
import { DriverService } from '../Services/DriverService';

const router = createBrowserRouter([
	{
		path: RoutesNames.Home,
		element: <PrivateRoute jwtStorage={JWTStorage} />,
		children: [
			{
				path: '',
				element: (
					<HomePage
						jwtService={JWTStorage}
						driverService={DriverService}
					/>
				),
				children: [
					{
						path: RoutesNames.Profile,
						element: (
							<ProfilePage
								authService={AuthService}
								blobService={BlobService}
							/>
						),
					},
					{
						path: RoutesNames.NewRide,
						element: (
							<NewRide
								rideService={RideService}
								driverService={DriverService}
							/>
						),
					},
					{
						path: RoutesNames.NewRidesDriver,
						element: (
							<NewRidesDriver
								rideService={RideService}
								driverService={DriverService}
								jwtService={JWTStorage}
							/>
						),
					},
					{
						path: RoutesNames.PreviousRidesUser,
						element: (
							<PreviousRidesUser rideService={RideService} />
						),
					},
					{
						path: RoutesNames.MyRides,
						element: (
							<PreviousRidesUser rideService={RideService} />
						),
					},
					{
						path: RoutesNames.AllRides,
						element: (
							<PreviousRidesUser rideService={RideService} />
						),
					},
					{
						path: RoutesNames.Verification,
						element: <Verification driverService={DriverService} />,
					},
				],
			},
		],
	},
	{
		path: `/${RoutesNames.Login}`,
		element: (
			<LoginPage authService={AuthService} jwtStorage={JWTStorage} />
		),
	},
	{
		path: `/${RoutesNames.Register}`,
		element: (
			<RegisterPage authService={AuthService} blobService={BlobService} />
		),
	},
]);

export function Router() {
	return <RouterProvider router={router} />;
}
