import { useGoogleLogin } from '@react-oauth/google';
import { IconBrandGoogle } from '@tabler/icons-react';
import { FC } from 'react';
import styles from './GoogleAuth.module.css';
import { GoogleAuthServiceType } from '../../Services/Google/GoogleAuth';
import { GoogleUserInfo } from '../../models/Auth/Google/GoogleUserInfo';
import googleLogo from '../../components/ui/img/google.png';

interface IProps {
	googleAuthService: GoogleAuthServiceType;
	setUserInfo: (userInfo: GoogleUserInfo) => void;
}

export const GoogleAuth: FC<IProps> = (props) => {
	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			const res = await props.googleAuthService.GetUserInfo(
				tokenResponse.access_token
			);
			if (!res) {
				alert('Error while authenticating with google');
				return;
			}
			props.setUserInfo(res);
		},
		onError: (error) => console.error(error),
	});

	return (
		<>
			<button
				className={styles.button}
				onClick={() => login()}
				type='button'
			>
				<img width={50} src={googleLogo} alt='google logo' />
			</button>
		</>
	);
};
