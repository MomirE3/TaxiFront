import { FC, useEffect, useState } from 'react';
import { AuthType, LoginData } from '../models/Auth/LoginData';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/Regex';
import { AuthServiceType } from '../Services/AuthService';
import { JWT } from '../models/Auth/JWT';
import { JWTStorageType } from '../Services/JWTStorage';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuth } from '../components/auth/GoogleAuth';
import { GoogleAuthService } from '../Services/Google/GoogleAuth';
import { Form, Button, Container } from 'react-bootstrap';

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
		<Container
			className='d-flex flex-column justify-content-center'
			style={{ height: '100vh', maxWidth: '400px' }}
		>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					onLogin();
				}}
			>
				<Form.Group controlId='email'>
					<Form.Label>Email</Form.Label>
					<Form.Control
						type='email'
						placeholder='Enter your email'
						value={loginFormData.Email}
						isInvalid={!loginFormValid.Email}
						onChange={(e) => {
							const val = e.target.value;
							setLoginFormData({ ...loginFormData, Email: val });
							setLoginFormValid({
								...loginFormValid,
								Email: EMAIL_REGEX.test(val),
							});
						}}
					/>
					<Form.Control.Feedback type='invalid'>
						Invalid email format
					</Form.Control.Feedback>
				</Form.Group>

				{loginFormData.authType === AuthType.TRADITIONAL && (
					<Form.Group controlId='password' className='mt-3'>
						<Form.Label>Password</Form.Label>
						<Form.Control
							type='password'
							placeholder='Enter your password'
							value={loginFormData.Password ?? ''}
							isInvalid={!loginFormValid.Password}
							onChange={(e) => {
								const val = e.target.value;
								setLoginFormData({
									...loginFormData,
									Password: val,
								});
								setLoginFormValid({
									...loginFormValid,
									Password: PASSWORD_REGEX.test(val),
								});
							}}
						/>
						<Form.Control.Feedback type='invalid'>
							Invalid password format
						</Form.Control.Feedback>
					</Form.Group>
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

				<div className='mt-3'>
					<span>Don't have an account? </span>
					<Link to='/register'>Register here!</Link>
				</div>

				<Button variant='primary' type='submit' className='mt-3'>
					Login
				</Button>
			</Form>
		</Container>
	);
};
