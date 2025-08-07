import LoadingDialog from '../components/LoadingDialog';
import { useAuth } from '../services/auth/firebase';
import './ProfilePage.css';

export default function ProfilePage() {
    const [user, isLoading] = useAuth();

    return (
        <div className="profile-page">
            {
                isLoading 
                ? 
                    <LoadingDialog>Loading</LoadingDialog>
                :
                    <fieldset>
                        <legend>
                            Profile
                        </legend>
                        <label>
                            First name
                            <input type='text' value={"Tran"} readOnly />
                        </label>
                        <label>
                            Last name
                            <input type='text' value={"Gia Huy"} readOnly />
                        </label>
                    </fieldset>
            }
        </div>
    );
}