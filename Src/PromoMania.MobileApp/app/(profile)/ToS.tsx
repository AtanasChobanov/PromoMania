import { ToSStyles } from '@/components/pages/TOS/ToSStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import React from 'react';
import { ImageBackground, ScrollView, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const ToS = () => {
   const { isDarkMode } = useSettings();
    const theme = isDarkMode ? darkTheme : lightTheme;
  return (
           <ImageBackground 
             source={theme.backgroundImage} 
             style={ToSStyles.backgroundImage} 
             resizeMode="cover">
    <ScrollView style={ToSStyles.container}>

     
      <Text style={[ToSStyles.title, {color: theme.colors.textPrimary}]}>Условия за ползване</Text>

      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Всички представени промоции, цени и продуктови оферти в това приложение
        са публично достъпни и извлечени от официалните уебсайтове на
        търговските вериги (напр. <Text style={[ToSStyles.link, {color: theme.colors.cancelColor}]}>kaufland.bg</Text>,{' '}
        <Text style={[ToSStyles.link, {color: theme.colors.cancelColor}]}>lidl.bg</Text> и др.).
      </Text>

      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Приложението не е свързано, не е одобрено и не се управлява от
        Kaufland, Lidl или която и да е друга търговска верига. Целта му е
        единствено да улесни потребителите, като обединява на едно място
        публично достъпна информация за актуалните седмични предложения на
        различни магазини.
      </Text>

      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Използваните данни са фактически, публично оповестени от съответните
        търговски вериги, без промени в съдържанието. Не се използват техни
        защитени търговски марки, лога или изображения, освен ако не са публично
        достъпни в контекста на промоцията.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>1. Общи положения</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Настоящите условия за ползване уреждат начина, по който потребителите
        използват приложението. С инсталирането или използването му Вие приемате
        тези условия и се съгласявате да ги спазвате.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>2. Отговорност</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Екипът на приложението не носи отговорност за промени в цените,
        наличността на стоки, неточности или забавяне при актуализиране на
        информацията. Винаги проверявайте крайните оферти на официалните сайтове
        на съответните магазини преди покупка.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>3. Поверителност и защита на данните</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Приложението не събира лични данни, освен ако потребителят изрично не ги
        предостави (например чрез форма за контакт или обратна връзка). Всяка
        предоставена информация се използва единствено с цел подобряване на
        услугата и няма да бъде споделяна с трети страни.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>4. Добросъвестно използване (Fair Use)</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Приложението следва принципа на добросъвестно използване – събира и
        показва публична информация с информативна и некомерсиална цел, без да
        променя, подвежда или замества оригиналните източници.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>5. Промени и актуализации</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Условията за ползване могат да бъдат актуализирани по всяко време, без
        предварително уведомление. Промените влизат в сила от момента на
        публикуването им в приложението. Продължаването на използването след
        актуализация означава, че приемате новите условия.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>6. Контакт и обратна връзка</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Ако имате въпроси, предложения или искате да заявите премахване на
        информация, можете да се свържете с екипа на приложението чрез имейл:{' '}
        <Text style={[ToSStyles.link, {color: theme.colors.cancelColor}]}>nikolovkaloan99@gmail.com</Text>
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>7. Права на интелектуална собственост</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Всички права върху марките, имената и материалите, публикувани от
        търговските вериги, принадлежат на съответните им притежатели.
        Приложението не претендира за собственост върху тях и не ги използва за
        комерсиални цели.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>8. Потребителски задължения</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Потребителят се съгласява да използва приложението по начин, който не
        нарушава действащото законодателство, авторските права и добрите нрави.
        Забранява се опит за манипулация на данните или автоматично извличане на
        съдържание чрез скриптове.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>9. Прекратяване на достъп</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Разработчиците си запазват правото да ограничат или прекратят достъпа до
        приложението при злоупотреба, опити за хакерски атаки или други действия,
        които застрашават сигурността на услугата.
      </Text>

      <Text style={[ToSStyles.sectionTitle, {color: theme.colors.textPrimary}]}>10. Заключителни разпоредби</Text>
      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary}]}>
        Настоящите условия са съобразени с българското законодателство. При
        възникване на спор, той се решава по взаимно съгласие, а при невъзможност
        – от компетентния съд в Република България.
      </Text>

      <Text style={[ToSStyles.paragraph, {color: theme.colors.textPrimary, marginTop: 20, textAlign: 'center', fontStyle: 'italic'}]}>
        Последна актуализация: октомври 2025 г.
      </Text>
            <View style={{marginBottom:moderateScale(50)}}></View>

    </ScrollView>
     </ImageBackground>
  );
};



export default ToS;