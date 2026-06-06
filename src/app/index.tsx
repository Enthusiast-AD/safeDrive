import { StyleSheet, Text, ImageBackground, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function App() {
  return (
    <ImageBackground 
      source={require("@/assets/car.jpg")} 
      style={styles.background}
      resizeMode="cover" 
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        
        <View style={styles.headerContainer}>
          <Ionicons name="car-sport" size={70} color="#F97316" style={styles.icon} />
          <Text style={styles.title}>Safe<Text style={styles.titleHighlight}>Drive</Text></Text>
          <Text style={styles.subtitle}>Drive Safe. Stay Safe.</Text>
        </View>

        <View style={styles.footerContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={() => router.push('/drive')}
          >
            <Text style={styles.buttonText}>START DRIVE</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </Pressable>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  icon: {
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 36,
    color: '#ffffff', 
    fontWeight: '900',
    letterSpacing: 1.5,
    // textTransform: 'uppercase',
  },
  titleHighlight: {
    color: '#F97316',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  footerContainer: {
    marginBottom: 40,
    width: '100%',
  },
  button: {
    flexDirection: 'row', 
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: '#EA580C',
    opacity: 0.9,
    transform: [{ scale: 0.98 }], 
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  }
});