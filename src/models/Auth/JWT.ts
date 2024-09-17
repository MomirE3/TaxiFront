import { JwtPayload } from 'jwt-decode';

export interface JWT {
	token: string;
}

export interface CustomJwtPayload extends JwtPayload {
	role: string;
	email: string;
}
