import { ChangeEvent, FC, useEffect, useState } from 'react';
import { RegisterData } from '../models/Auth/RegisterData';
import { UserType } from '../models/Auth/UserType';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/Regex';
import { AuthServiceType } from '../Services/AuthService';
import { Link, useNavigate } from 'react-router-dom';
import { RoutesNames } from '../Router/Routes';
import { BlobServiceType } from '../Services/BlobService';
import { SHA256 } from 'crypto-js';
import { GoogleAuth } from '../components/auth/GoogleAuth';
import { GoogleAuthService } from '../Services/Google/GoogleAuth';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

interface IProps {
	authService: AuthServiceType;
	blobService: BlobServiceType;
}

export const RegisterPage: FC<IProps> = (props) => {
	const navigate = useNavigate();

	const [registerFormData, setRegisterFormData] = useState<RegisterData>({
		Username: '',
		Email: '',
		Password: '',
		FullName: '',
		Address: '',
		DateOfBirth: new Date().toUTCString(),
		Type: UserType.Client,
	} as RegisterData);

	const [localImagePath, setLocalImagePath] = useState<string | File>('');
	const [localImageName, setLocalImageName] = useState<string | undefined>(
		undefined
	);
	const [usedGoogleAuth, setUsedGoogleAuth] = useState(false);

	const [registerFormValid, setRegisterFormValid] = useState({
		Username: true,
		Email: true,
		Password: true,
		FullName: true,
		DateOfBirth: true,
		Address: true,
		Type: true,
		ImagePath: true,
	});

	const isValid = () => {
		return (
			registerFormValid.Username &&
			registerFormValid.Email &&
			registerFormValid.Password &&
			registerFormValid.FullName &&
			registerFormValid.DateOfBirth &&
			registerFormValid.Address &&
			registerFormValid.Type &&
			registerFormValid.ImagePath
		);
	};

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setLocalImageName(e.target.files[0].name);
			setLocalImagePath(e.target.files[0]);
		}
	};

	useEffect(() => {}, [localImagePath]);

	async function onRegister() {
		if (!isValid() || !localImagePath || !localImageName) {
			alert('Please fill out the form');
			return;
		}

		let file;

		if (usedGoogleAuth) {
			const localImagePathString =
				typeof localImagePath === 'string' ? localImagePath : '';
			if (localImagePathString) {
				const fetchedImg = await fetch(localImagePathString);
				const blobImg = await fetchedImg.blob();
				file = new File([blobImg], localImageName);
			}
		} else {
			file = localImagePath instanceof File ? localImagePath : null;
		}

		if (!file) {
			alert('Failed to process the image.');
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('fileName', localImageName);
		const hashedEmail = SHA256(registerFormData.Email).toString();

		const uploadImgRes = await props.blobService.UploadProfileImage(
			formData,
			hashedEmail
		);

		if (!uploadImgRes) {
			alert('Failed uploading image.');
			return;
		}

		let registerDataSend = { ...registerFormData };

		if (usedGoogleAuth) {
			registerDataSend.Password = undefined;
			registerDataSend.ImagePath = uploadImgRes;
		} else {
			registerDataSend.ImagePath = uploadImgRes;
		}

		const res = await props.authService.Register(registerDataSend);

		if (!res) {
			alert('Registration failed, please try different parameters.');
			return;
		}

		alert('Registration successful, please log in.');
		navigate(`../${RoutesNames.Login}`);
	}

	function getFirstPartOfEmail(email: string) {
		if (!email || typeof email !== 'string') {
			throw new Error('Invalid email input');
		}
		const firstPart = email.split('@')[0];
		return firstPart;
	}

	function formatDateForInput(dateString: string) {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	return (
		<Container>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					onRegister();
				}}
			>
				<Form.Group controlId='formFile' className='mb-3'>
					<Form.Label>Upload Image</Form.Label>
					<Form.Control
						type='file'
						accept='image/*'
						onChange={handleImageChange}
					/>
				</Form.Group>

				{localImagePath && (
					<div className='text-center mb-3'>
						<img
							width={100}
							src={
								localImagePath instanceof File
									? URL.createObjectURL(localImagePath)
									: localImagePath
							}
							alt='Preview'
						/>
					</div>
				)}

				<Form.Group controlId='formFullName' className='mb-3'>
					<Form.Label>Full Name</Form.Label>
					<Form.Control
						type='text'
						isInvalid={!registerFormValid.FullName}
						onChange={(e) => {
							const val = e.target.value;
							setRegisterFormData({
								...registerFormData,
								FullName: val,
							});
							setRegisterFormValid({
								...registerFormValid,
								FullName: val.length > 3,
							});
						}}
						value={registerFormData.FullName}
					/>
					<Form.Control.Feedback type='invalid'>
						Full name must be at least 4 characters long
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group controlId='formDateOfBirth' className='mb-3'>
					<Form.Label>Date of Birth</Form.Label>
					<Form.Control
						type='date'
						onChange={(e) => {
							const val = e.target.value;
							setRegisterFormData({
								...registerFormData,
								DateOfBirth: val,
							});
						}}
						value={formatDateForInput(registerFormData.DateOfBirth)}
					/>
				</Form.Group>

				<Form.Group controlId='formUsername' className='mb-3'>
					<Form.Label>Username</Form.Label>
					<Form.Control
						type='text'
						isInvalid={!registerFormValid.Username}
						onChange={(e) => {
							const val = e.target.value;
							setRegisterFormData({
								...registerFormData,
								Username: val,
							});
							setRegisterFormValid({
								...registerFormValid,
								Username: val.length >= 3,
							});
						}}
						value={registerFormData.Username}
					/>
					<Form.Control.Feedback type='invalid'>
						Username must be at least 4 characters long
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group controlId='formEmail' className='mb-3'>
					<Form.Label>Email</Form.Label>
					<Form.Control
						type='email'
						isInvalid={!registerFormValid.Email}
						onChange={(e) => {
							const val = e.target.value;
							setRegisterFormData({
								...registerFormData,
								Email: val,
							});
							setRegisterFormValid({
								...registerFormValid,
								Email: EMAIL_REGEX.test(val),
							});
						}}
						value={registerFormData.Email}
					/>
					<Form.Control.Feedback type='invalid'>
						Invalid email format
					</Form.Control.Feedback>
				</Form.Group>

				{!usedGoogleAuth && (
					<Form.Group controlId='formPassword' className='mb-3'>
						<Form.Label>Password</Form.Label>
						<Form.Control
							type='password'
							isInvalid={!registerFormValid.Password}
							onChange={(e) => {
								const val = e.target.value;
								setRegisterFormData({
									...registerFormData,
									Password: val,
								});
								setRegisterFormValid({
									...registerFormValid,
									Password: PASSWORD_REGEX.test(val),
								});
							}}
							value={registerFormData.Password ?? ''}
						/>
						<Form.Control.Feedback type='invalid'>
							Password must be at least 8 characters long and
							include a number and a special character
						</Form.Control.Feedback>
					</Form.Group>
				)}

				<Form.Group controlId='formAddress' className='mb-3'>
					<Form.Label>Address</Form.Label>
					<Form.Control
						type='text'
						isInvalid={!registerFormValid.Address}
						onChange={(e) => {
							const val = e.target.value;
							setRegisterFormData({
								...registerFormData,
								Address: val,
							});
							setRegisterFormValid({
								...registerFormValid,
								Address: val.length > 3,
							});
						}}
						value={registerFormData.Address}
					/>
					<Form.Control.Feedback type='invalid'>
						Address must be at least 4 characters long
					</Form.Control.Feedback>
				</Form.Group>

				{!usedGoogleAuth && (
					<Form.Group controlId='formUserType' className='mb-3'>
						<Form.Label>User Type</Form.Label>
						<div>
							<Form.Check
								type='radio'
								label='Client'
								name='userType'
								checked={
									registerFormData.Type === UserType.Client
								}
								onChange={() => {
									setRegisterFormData({
										...registerFormData,
										Type: UserType.Client,
									});
								}}
							/>
							<Form.Check
								type='radio'
								label='Driver'
								name='userType'
								checked={
									registerFormData.Type === UserType.Driver
								}
								onChange={() => {
									setRegisterFormData({
										...registerFormData,
										Type: UserType.Driver,
									});
								}}
							/>
						</div>
					</Form.Group>
				)}

				<GoogleAuth
					googleAuthService={GoogleAuthService}
					setUserInfo={(userInfo) => {
						setRegisterFormData({
							...registerFormData,
							Password: undefined,
							Email: userInfo.email,
							FullName: userInfo.name,
							Username: getFirstPartOfEmail(userInfo.email),
							DateOfBirth: new Date().toISOString(),
							Address: 'Random Address',
							Type: UserType.Client,
						});
						setRegisterFormValid({
							Address: true,
							DateOfBirth: true,
							Email: EMAIL_REGEX.test(userInfo.email),
							FullName: userInfo.name.length > 3,
							ImagePath: true,
							Password: true,
							Username: true,
							Type: true,
						});
						setLocalImagePath(userInfo.picture);
						setLocalImageName('image.png');
						setUsedGoogleAuth(true);
					}}
				/>

				<div className='mt-3'>
					<p>
						Already have an account? <Link to='/Login'>Log In</Link>
					</p>
				</div>

				<Button type='submit' variant='primary' className='w-100'>
					Register
				</Button>
			</Form>
		</Container>
	);
};
