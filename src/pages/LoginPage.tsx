import { FC, useEffect, useState } from 'react';
import { AuthType, LoginData } from '../models/Auth/LoginData';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/Regex';
import { AuthServiceType } from '../Services/AuthService';
import { JWT } from '../models/Auth/JWT';
import { JWTStorageType } from '../Services/JWTStorage';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuth } from '../components/auth/GoogleAuth';
import { GoogleAuthService } from '../Services/Google/GoogleAuth';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';

interface IProps {
	authService: AuthServiceType;
	jwtStorage: JWTStorageType;
}

export const LoginPage: FC<IProps> = (props) => {
	const navigate = useNavigate();

	const [loginFormData, setLoginFormData] = useState<LoginData>({
		Email: '',
		Password: '',
		authType: AuthType.TRADITIONAL,
	});

	const [loginFormValid, setLoginFormValid] = useState({
		Email: true,
		Password: true,
	});

	const [usedGoogleAuth, setUsedGoogleAuth] = useState(false);

	const isValid = () => loginFormValid.Email && loginFormValid.Password;

	async function onLogin() {
		if (!isValid()) {
			alert('Please fill out the form');
			return;
		}

		const res = await props.authService.Login(loginFormData);

		if (!res) {
			alert('Invalid credentials.');
			return;
		}

		const jwt = res.data as JWT;
		props.jwtStorage.setJWT(jwt);
		navigate(`../`);
	}

	useEffect(() => {
		const isFormValid = loginFormValid.Email && loginFormData.Email;

		if (isFormValid && usedGoogleAuth) {
			onLogin();
		}
	}, [loginFormData, loginFormValid]);

	return (
		<Box
			component='form'
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				maxWidth: 400,
				margin: 'auto',
				height: '100vh',
				justifyContent: 'center',
			}}
			onSubmit={(e) => {
				e.preventDefault();
				onLogin();
			}}
		>
			<TextField
				label='Email'
				variant='outlined'
				error={!loginFormValid.Email}
				helperText={!loginFormValid.Email ? 'Invalid email format' : ''}
				onChange={(e) => {
					const val = e.target.value;
					setLoginFormData({ ...loginFormData, Email: val });
					setLoginFormValid({
						...loginFormValid,
						Email: EMAIL_REGEX.test(val),
					});
				}}
				value={loginFormData.Email}
				type='email'
				fullWidth
			/>

			{loginFormData.authType === AuthType.TRADITIONAL && (
				<TextField
					label='Password'
					variant='outlined'
					type='password'
					error={!loginFormValid.Password}
					helperText={
						!loginFormValid.Password
							? 'Invalid password format'
							: ''
					}
					onChange={(e) => {
						const val = e.target.value;
						setLoginFormData({ ...loginFormData, Password: val });
						setLoginFormValid({
							...loginFormValid,
							Password: PASSWORD_REGEX.test(val),
						});
					}}
					value={loginFormData.Password ?? ''}
					fullWidth
				/>
			)}

			<GoogleAuth
				googleAuthService={GoogleAuthService}
				setUserInfo={(userInfo) => {
					setLoginFormData({
						Password: undefined,
						Email: userInfo.email,
						authType: AuthType.GOOGLE,
					});
					setLoginFormValid({
						...loginFormValid,
						Email: EMAIL_REGEX.test(userInfo.email),
					});
					setUsedGoogleAuth(true);
				}}
			/>

			<Typography variant='body2'>
				Don't have an account?{' '}
				<Link to='/register'>Register here!</Link>
			</Typography>

			<Button type='submit' variant='contained' color='primary'>
				Login
			</Button>
		</Box>
	);
};
