import { 
  PushNotifications, 
  PushNotificationSchema, 
  Token,
  ActionPerformed
} from '@capacitor/push-notifications';
import { 
  LocalNotifications,
  LocalNotificationSchema
} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationConfig {
  title: string;
  body: string;
  id?: number;
  schedule?: {
    at?: Date;
    every?: 'day' | 'week' | 'month' | 'year';
    count?: number;
  };
  data?: any;
}

export class NotificationService {
  private static isInitialized = false;
  private static pushToken: string | null = null;

  /**
   * Initialize notification services
   */
  static async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isInitialized) {
      return;
    }

    try {
      // Initialize push notifications
      await this.initializePushNotifications();
      
      // Initialize local notifications
      await this.initializeLocalNotifications();
      
      this.isInitialized = true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error initializing notifications:', error);
      }
    }
  }

  /**
   * Initialize push notifications
   */
  private static async initializePushNotifications(): Promise<void> {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('Push notification permission denied');
    }

    await PushNotifications.register();

    // Add listeners
    await PushNotifications.addListener('registration', (token: Token) => {
      this.pushToken = token.value;
      if (process.env.NODE_ENV !== 'production') {
        console.log('Push registration success, token: ' + token.value);
      }
    });

    await PushNotifications.addListener('registrationError', (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error on registration: ' + JSON.stringify(error));
      }
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Push received: ' + JSON.stringify(notification));
        }
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Push action performed: ' + JSON.stringify(notification));
        }
      }
    );
  }

  /**
   * Initialize local notifications
   */
  private static async initializeLocalNotifications(): Promise<void> {
    let permStatus = await LocalNotifications.checkPermissions();
    
    if (permStatus.display === 'prompt') {
      permStatus = await LocalNotifications.requestPermissions();
    }

    if (permStatus.display !== 'granted') {
      throw new Error('Local notification permission denied');
    }

    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notification) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Local notification action performed', notification);
        }
      }
    );
  }

  /**
   * Get push notification token
   */
  static getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Schedule a local notification
   */
  static async scheduleNotification(config: NotificationConfig): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const notification: LocalNotificationSchema = {
      title: config.title,
      body: config.body,
      id: config.id || Date.now(),
      schedule: config.schedule,
      extra: config.data,
      smallIcon: 'ic_launcher',
      largeIcon: 'ic_launcher',
      channelId: 'dietwise_notifications'
    };

    await LocalNotifications.schedule({
      notifications: [notification]
    });
  }

  /**
   * Schedule meal reminders
   */
  static async scheduleMealReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Cancel existing meal reminders
    await this.cancelMealReminders();

    const mealTimes = [
      { hour: 8, minute: 0, title: 'Breakfast Reminder', id: 1001 },
      { hour: 12, minute: 30, title: 'Lunch Reminder', id: 1002 },
      { hour: 18, minute: 30, title: 'Dinner Reminder', id: 1003 }
    ];

    for (const meal of mealTimes) {
      const scheduleDate = new Date();
      scheduleDate.setHours(meal.hour, meal.minute, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduleDate < new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      await this.scheduleNotification({
        id: meal.id,
        title: meal.title,
        body: "Don't forget to log your meal!",
        schedule: {
          at: scheduleDate,
          every: 'day'
        }
      });
    }
  }

  /**
   * Cancel meal reminder notifications
   */
  static async cancelMealReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const mealReminderIds = [1001, 1002, 1003];
    const pending = await LocalNotifications.getPending();
    
    const toCancel = pending.notifications
      .filter(n => mealReminderIds.includes(n.id))
      .map(n => ({ id: n.id }));

    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }
  }

  /**
   * Schedule water reminder
   */
  static async scheduleWaterReminders(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Schedule reminders every 2 hours between 9 AM and 9 PM
    for (let hour = 9; hour <= 21; hour += 2) {
      const scheduleDate = new Date();
      scheduleDate.setHours(hour, 0, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduleDate < new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      await this.scheduleNotification({
        id: 2000 + hour,
        title: '💧 Water Reminder',
        body: 'Stay hydrated! Time for a glass of water.',
        schedule: {
          at: scheduleDate,
          every: 'day'
        }
      });
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await LocalNotifications.cancel({
      notifications: (await LocalNotifications.getPending()).notifications
    });
  }
}