import axios, { AxiosResponse } from 'axios';
import { LoginData } from '../models/Auth/LoginData';
import { RegisterData } from '../models/Auth/RegisterData';
import sha256 from 'crypto-js/sha256';
import { JWTStorage } from './JWTStorage';
import { Profile, UpdateUserProfileRequest } from '../models/Auth/Profile';

const AUTH_CONTROLLER_URL = `${process.env.REACT_APP_BACKEND_URL}/auth`;

async function Login(loginData: LoginData) {
	try {
		if (loginData.Password) {
			loginData.Password = sha256(loginData.Password).toString();
		}
		const res = await axios.post(`${AUTH_CONTROLLER_URL}/login`, loginData);
		return res;
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function Register(registerData: RegisterData) {
	try {
		if (registerData.Password) {
			registerData.Password = sha256(registerData.Password).toString();
		}
		const res = await axios.post(
			`${AUTH_CONTROLLER_URL}/register`,
			registerData
		);
		return res;
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function UpdateProfile(updateData: UpdateUserProfileRequest) {
	const jtwToken = JWTStorage.getJWT();

	let dataToSend = updateData;
	if(updateData.password){
		dataToSend = {
			...dataToSend,
			password: sha256(updateData.password).toString()
		} as UpdateUserProfileRequest
	}
	
	try {
		const res = await axios.patch(
			`${AUTH_CONTROLLER_URL}/update-profile`,
			dataToSend,
			{
				headers: {
					Authorization: `Bearer ${jtwToken?.token}`,
				},
			}
		);
		return res.data;
	} catch {
		return null;
	}
}

async function GetProfile() {
	const jtwToken = JWTStorage.getJWT();
	try {
		const res = await axios.get(`${AUTH_CONTROLLER_URL}/profile`, {
			headers: {
				Authorization: `Bearer ${jtwToken?.token}`,
			},
		});
		return res.data;
	} catch {
		return null;
	}
}

export type AuthServiceType = {
	Login: (loginData: LoginData) => Promise<null | AxiosResponse<any, any>>;
	Register: (
		registerData: RegisterData
	) => Promise<null | AxiosResponse<any, any>>;
	GetProfile: () => Promise<Profile | null>;
	UpdateProfile: (
		updateData: UpdateUserProfileRequest
	) => Promise<Profile | null>;
};

export const AuthService: AuthServiceType = {
	Login,
	Register,
	GetProfile,
	UpdateProfile,
};
