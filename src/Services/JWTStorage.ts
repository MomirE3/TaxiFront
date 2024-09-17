import { CustomJwtPayload, JWT } from '../models/Auth/JWT';
import { jwtDecode } from 'jwt-decode';

const LOCAL_STORAGE_KEY = 'jwt_token';

function setJWT(jwt: JWT) {
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jwt));
}

function getJWT() {
	const jwtObj = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!jwtObj) {
		return null;
	}

	return JSON.parse(jwtObj);
}

function removeJWT() {
	localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function decodeJWT(token: string): CustomJwtPayload | null {
	try {
		return jwtDecode<CustomJwtPayload>(token);
	} catch (error) {
		console.error('Invalid JWT token:', error);
		return null;
	}
}

export type JWTStorageType = {
	setJWT: (jwt: JWT) => void;
	getJWT: () => JWT | null;
	removeJWT: () => void;
	decodeJWT: (token: string) => CustomJwtPayload | null;
};

export const JWTStorage: JWTStorageType = {
	setJWT,
	getJWT,
	removeJWT,
	decodeJWT,
};
