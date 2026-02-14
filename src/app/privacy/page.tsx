export default function PrivacyPage() {
  return (
    <main className="container py-8">
      <article className="card space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-bold">Политика обработки персональных данных</h1>
        </header>

        <section className="space-y-4">
          <p>
            Настоящая Политика обработки персональных данных разработана в соответствии с Федеральным законом РФ №152-ФЗ
            «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности
            персональных данных.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Оператор персональных данных</h2>
          <p>
            Индивидуальный предприниматель
            <br />
            ИП Кошелева Валентина Валерьевна
            <br />
            ОГРНИП 322265100113550
            <br />
            ИНН 263106597812
          </p>

          <p>
            Дата регистрации: 25 октября 2022 г.
            <br />
            Регистратор: Межрайонная инспекция ФНС России № 11 по Ставропольскому краю
          </p>

          <p>
            Контактный email: credomir26@mail.ru
            <br />
            Контактный телефон: +7 988 731 74 04
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Персональные данные, которые обрабатываются</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Имя</li>
            <li>Номер телефона</li>
            <li>Адрес электронной почты</li>
            <li>Иные данные, предоставленные пользователем через формы сайта</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Цели обработки персональных данных</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Обработка заявок</li>
            <li>Связь с пользователем</li>
            <li>Заключение и исполнение договоров</li>
            <li>Предоставление услуг</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Права пользователя</h2>
          <p>Пользователь имеет право:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Получать информацию о своих персональных данных</li>
            <li>Требовать уточнения или удаления данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
          </ul>
          <p>Отзыв согласия осуществляется путем направления письма на электронную почту Оператора.</p>
        </section>
      </article>
    </main>
  );
}
