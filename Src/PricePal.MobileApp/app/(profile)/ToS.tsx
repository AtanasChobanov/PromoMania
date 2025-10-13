import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const ToS = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Условия за ползване</Text>

      <Text style={styles.paragraph}>
        Всички представени промоции, цени и продуктови оферти в това приложение
        са публично достъпни и извлечени от официалните уебсайтове на
        търговските вериги (напр. <Text style={styles.link}>kaufland.bg</Text>,{' '}
        <Text style={styles.link}>lidl.bg</Text> и др.).
      </Text>

      <Text style={styles.paragraph}>
        Приложението не е свързано, не е одобрено и не се управлява от
        Kaufland, Lidl или която и да е друга търговска верига. Целта му е
        единствено да улесни потребителите, като обединява на едно място
        публично достъпна информация за актуалните седмични предложения на
        различни магазини.
      </Text>

      <Text style={styles.paragraph}>
        Използваните данни са фактически, публично оповестени от съответните
        търговски вериги, без промени в съдържанието. Не се използват техни
        защитени търговски марки, лога или изображения, освен ако не са публично
        достъпни в контекста на промоцията.
      </Text>

      <Text style={styles.sectionTitle}>1. Общи положения</Text>
      <Text style={styles.paragraph}>
        Настоящите условия за ползване уреждат начина, по който потребителите
        използват приложението. С инсталирането или използването му Вие приемате
        тези условия и се съгласявате да ги спазвате.
      </Text>

      <Text style={styles.sectionTitle}>2. Отговорност</Text>
      <Text style={styles.paragraph}>
        Екипът на приложението не носи отговорност за промени в цените,
        наличността на стоки, неточности или забавяне при актуализиране на
        информацията. Винаги проверявайте крайните оферти на официалните сайтове
        на съответните магазини преди покупка.
      </Text>

      <Text style={styles.sectionTitle}>3. Поверителност и защита на данните</Text>
      <Text style={styles.paragraph}>
        Приложението не събира лични данни, освен ако потребителят изрично не ги
        предостави (например чрез форма за контакт или обратна връзка). Всяка
        предоставена информация се използва единствено с цел подобряване на
        услугата и няма да бъде споделяна с трети страни.
      </Text>

      <Text style={styles.sectionTitle}>4. Добросъвестно използване (Fair Use)</Text>
      <Text style={styles.paragraph}>
        Приложението следва принципа на добросъвестно използване – събира и
        показва публична информация с информативна и некомерсиална цел, без да
        променя, подвежда или замества оригиналните източници.
      </Text>

      <Text style={styles.sectionTitle}>5. Промени и актуализации</Text>
      <Text style={styles.paragraph}>
        Условията за ползване могат да бъдат актуализирани по всяко време, без
        предварително уведомление. Промените влизат в сила от момента на
        публикуването им в приложението. Продължаването на използването след
        актуализация означава, че приемате новите условия.
      </Text>

      <Text style={styles.sectionTitle}>6. Контакт и обратна връзка</Text>
      <Text style={styles.paragraph}>
        Ако имате въпроси, предложения или искате да заявите премахване на
        информация, можете да се свържете с екипа на приложението чрез имейл:{' '}
        <Text style={styles.link}>support@example.com</Text>
      </Text>

      <Text style={styles.sectionTitle}>7. Права на интелектуална собственост</Text>
      <Text style={styles.paragraph}>
        Всички права върху марките, имената и материалите, публикувани от
        търговските вериги, принадлежат на съответните им притежатели.
        Приложението не претендира за собственост върху тях и не ги използва за
        комерсиални цели.
      </Text>

      <Text style={styles.sectionTitle}>8. Потребителски задължения</Text>
      <Text style={styles.paragraph}>
        Потребителят се съгласява да използва приложението по начин, който не
        нарушава действащото законодателство, авторските права и добрите нрави.
        Забранява се опит за манипулация на данните или автоматично извличане на
        съдържание чрез скриптове.
      </Text>

      <Text style={styles.sectionTitle}>9. Прекратяване на достъп</Text>
      <Text style={styles.paragraph}>
        Разработчиците си запазват правото да ограничат или прекратят достъпа до
        приложението при злоупотреба, опити за хакерски атаки или други действия,
        които застрашават сигурността на услугата.
      </Text>

      <Text style={styles.sectionTitle}>10. Заключителни разпоредби</Text>
      <Text style={styles.paragraph}>
        Настоящите условия са съобразени с българското законодателство. При
        възникване на спор, той се решава по взаимно съгласие, а при невъзможност
        – от компетентния съд в Република България.
      </Text>

      <Text style={[styles.paragraph, { marginTop: 20, textAlign: 'center', fontStyle: 'italic' }]}>
        Последна актуализация: октомври 2025 г.
      </Text>
            <View style={{marginBottom:moderateScale(50)}}></View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  title: {
    marginTop: moderateScale(25),
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(103, 218, 191, 1)',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  link: {
    color: 'rgba(103, 218, 191, 1)',
    textDecorationLine: 'underline',
  },
});

export default ToS;
