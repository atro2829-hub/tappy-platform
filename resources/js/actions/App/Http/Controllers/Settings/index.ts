import ProfileController from './ProfileController'
import KycController from './KycController'
import SecurityController from './SecurityController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    KycController: Object.assign(KycController, KycController),
    SecurityController: Object.assign(SecurityController, SecurityController),
}

export default Settings