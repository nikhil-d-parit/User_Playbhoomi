import { StyleSheet } from "react-native";

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  imageLogo: {
    width: 271.72,
    height: 91,
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: 16,
    color: "#303030",
    fontFamily: "Inter_400Regular",
    position: "relative",
    bottom: 20,
  },
  screenHeader: {
    fontSize: 18,
    color: "#343A40",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 18,
  },
   textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#1E1E1E",
  },

  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  error: { color: "red", marginBottom: 8 },
  label: { color: "#fff", marginBottom: 10, fontSize: 16 },
  hearofScreen: { color: "#343A40", fontFamily: "Inter_700Bold", fontSize: 18 },
});
