import { StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const registerStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(100),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(32),

  },
  backButton: {
     width: 40,
     height: 40,
     top:scale(55),
    marginHorizontal: 20,
    position: 'absolute',
    zIndex: 100,   
     borderRadius: 20,
     borderColor: 'white',
     borderStyle: 'solid',
     borderWidth: 1,
     overflow: 'hidden',
     justifyContent: 'center',
     alignItems: 'center',
   },
    backButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
    alignSelf:'center'
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#666666',
        alignSelf:'center'

  },

  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#ffff',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: verticalScale(48),
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: scale(45),
  },
  eyeIcon: {
    position: 'absolute',
    right: scale(12),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordRequirements: {
    marginTop: verticalScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    gap: verticalScale(8),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  checkIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconValid: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(46, 170, 134, 1)',
  },
  checkIconText: {
    color: '#ffffff',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: moderateScale(13),
    color: '#666666',
    flex: 1,
  },
  requirementTextValid: {
    color: 'rgba(46, 170, 134, 1)',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor:'#FFFF',
    marginRight: scale(12),
    marginTop: verticalScale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#666666',
    lineHeight: moderateScale(20),
  },
  link: {
    color: 'rgba(46, 170, 134, 1)',
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor:'white',
    borderWidth:1,
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(6),
    },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(32),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: scale(16),
    color: '#999999',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: moderateScale(14),
  },
  loginLink: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
      tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});