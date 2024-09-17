import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FC } from 'react';
import { JWTStorageType } from '../Services/JWTStorage';
import { RoutesNames } from './Routes';

interface IProps {
	jwtStorage: JWTStorageType;
}

export const PrivateRoute: FC<IProps> = (props) => {
	const isUserAuth = props.jwtStorage.getJWT() !== null;

	const location = useLocation();

	if (!isUserAuth) {
		//redirect to this route after login
		return (
			<Navigate
				to={RoutesNames.Login}
				replace
				state={{
					redirectTo: location,
				}}
			/>
		);
	}

	return (
		<div>
			<Outlet />
		</div>
	);
};
