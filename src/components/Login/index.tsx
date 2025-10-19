import { useState } from 'react';
import LoginForm from './LoginLayoutBody/index';
import RegisterForm from './RegisterLayoutBody/index';
import ForgotPasswordForm from './ForgotPassword';

const UserLoginRegisterHub = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    return (
        isForgotPassword ? (
            <ForgotPasswordForm
                setIsForgotPassword={setIsForgotPassword} />
        ) :
        isRegister ? (
            <RegisterForm
                setIsLogin={setIsRegister} />
        ) : (
            <LoginForm
                setIsForgotPassword={setIsForgotPassword}
                setIsRegister={setIsRegister} />    
        )
    )
}

export { UserLoginRegisterHub }
