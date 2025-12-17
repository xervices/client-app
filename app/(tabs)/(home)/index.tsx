import { Layout } from '@/components/layout';
import { Header } from '@/components/home/header';
import { ScrollView, View } from 'react-native';
import { SearchInput } from '@/components/home/search-input';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { Promotions } from '@/components/home/promotions';
import { Services } from '@/components/home/services';
import { UserOfWeek } from '@/components/home/user-of-week';
import { ActiveJobs } from '@/components/home/active-jobs';
import EnableLocationDialog from '@/components/enable-location-dialog';
import { useUsersControllerGetCurrentUser } from '@/api/generated/users/users';

export default function Screen() {
  return (
    <Layout
      useBackground
      horizontalPadding={false}
      stickyHeader={
        <View className="px-6 pb-4">
          <Header />
        </View>
      }>
      <View className="flex-1 gap-4">
        <EnableLocationDialog />

        <SearchInput />

        <Promotions />

        <Services />

        <UserOfWeek />

        <ActiveJobs />
      </View>
    </Layout>
  );
}
