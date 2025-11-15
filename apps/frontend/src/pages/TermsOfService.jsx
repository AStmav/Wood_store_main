import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Пользовательское соглашение
            </h1>
            <p className="text-gray-600">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Контент соглашения */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Общие положения</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                  администрацией интернет-магазина «Сказкин дом» (далее — «Администрация», «Магазин», «Мы») 
                  и пользователем услуг интернет-магазина (далее — «Пользователь», «Вы»).
                </p>
                <p>
                  Используя сайт интернет-магазина, Вы полностью принимаете условия настоящего Соглашения 
                  и обязуетесь их соблюдать. Если Вы не согласны с какими-либо условиями, Вы не должны 
                  использовать услуги интернет-магазина.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Регистрация и учетная запись</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Для оформления заказов в интернет-магазине Вы можете зарегистрировать учетную запись, 
                  указав достоверные персональные данные.
                </p>
                <p>
                  Вы несете ответственность за сохранность учетных данных (логина и пароля) и за все действия, 
                  совершенные под Вашей учетной записью. В случае утери учетных данных или несанкционированного 
                  доступа к Вашей учетной записи, Вы обязаны незамедлительно сообщить об этом Администрации.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Оформление и оплата заказа</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Вы можете оформлять заказы на товары, представленные в каталоге интернет-магазина. 
                  Цена товара указана на сайте и может быть изменена без предварительного уведомления.
                </p>
                <p>
                  При оформлении заказа Вы предоставляете достоверную информацию, необходимую для его выполнения, 
                  включая контактные данные и адрес доставки.
                </p>
                <p>
                  Оплата заказа производится способами, указанными на сайте. После подтверждения заказа 
                  Администрация свяжется с Вами для уточнения деталей доставки.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Доставка товара</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Доставка товара осуществляется в сроки и способами, указанными на сайте. 
                  Администрация приложит все усилия для выполнения заказа в указанные сроки, 
                  однако не несет ответственности за задержки, вызванные действиями третьих лиц.
                </p>
                <p>
                  При получении товара Вы обязаны проверить его качество, комплектность и соответствие 
                  заявленным характеристикам. При обнаружении недостатков необходимо сообщить об этом 
                  в момент получения товара.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Возврат и обмен товара</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Возврат товара надлежащего качества возможен в течение 14 дней с момента покупки, 
                  при условии сохранения товарного вида, потребительских свойств, упаковки и документов.
                </p>
                <p>
                  Возврат товара ненадлежащего качества осуществляется в соответствии с законодательством 
                  Российской Федерации о защите прав потребителей.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Интеллектуальная собственность</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Все материалы сайта, включая тексты, графические изображения, логотипы, являются 
                  объектами интеллектуальной собственности Администрации и защищены законом об авторском праве.
                </p>
                <p>
                  Использование материалов сайта без письменного разрешения Администрации запрещено.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Персональные данные</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Обработка персональных данных Пользователя осуществляется в соответствии с законодательством 
                  Российской Федерации и Политикой конфиденциальности интернет-магазина.
                </p>
                <p>
                  Предоставляя свои персональные данные, Вы даете согласие на их обработку Администрацией 
                  в целях выполнения заказов и улучшения качества обслуживания.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Ответственность</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Администрация не несет ответственности за ущерб, причиненный Пользователю в результате 
                  использования или невозможности использования сайта, включая упущенную выгоду.
                </p>
                <p>
                  Пользователь несет полную ответственность за достоверность предоставленной информации 
                  и за действия, совершенные на сайте.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Изменение условий соглашения</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Администрация оставляет за собой право вносить изменения в настоящее Соглашение 
                  в любое время без предварительного уведомления.
                </p>
                <p>
                  Продолжение использования сайта после внесения изменений означает Ваше согласие 
                  с новыми условиями Соглашения.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Контактная информация</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  По всем вопросам, связанным с использованием сайта и оформлением заказов, 
                  Вы можете обращаться к Администрации:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Telegram: <a href="https://t.me/+79141023232" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">+7 (914) 102-32-32</a>
                  </li>
                  <li>
                    WhatsApp: <a href="https://wa.me/79141023232" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">+7 (914) 102-32-32</a>
                  </li>
                  <li>Адрес: г. Якутск, 203 мкр</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Кнопка "Назад на главную" */}
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад на главную
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;

