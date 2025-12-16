import { Link } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useSupabase } from '../lib/supabase';

export default function HomeScreen() {
  const supabase = useSupabase();

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Flippin'</Text>
      <Text style={styles.title}>Rapid intake, AI listings, and profit clarity.</Text>
      <Text style={styles.subtitle}>Upload photos, run AI, and save drafts even offline.</Text>
      <Link href="/intake" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start intake</Text>
        </TouchableOpacity>
      </Link>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' }} style={styles.hero} />
      <Text style={styles.meta}>Connected to {supabase?.url}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
  },
  kicker: {
    color: '#a3e635',
    letterSpacing: 2,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: '#cbd5f5',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#052e16',
    fontWeight: '700',
    textAlign: 'center',
  },
  hero: {
    marginTop: 20,
    height: 200,
    borderRadius: 16,
  },
  meta: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 12,
  },
});
