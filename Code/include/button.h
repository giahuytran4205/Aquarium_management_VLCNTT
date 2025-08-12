// ESP8266 code

class button {	
private:
  bool state;
  unsigned long timer;
  int pin;
public:
  button(){
    timer = 0; 
    state = false;
    pin = 0; // mặc định GPIO0 (D3 trên NodeMCU)
  }

  void attach(int _pin) { 
    pin = _pin;
    pinMode(pin, INPUT_PULLUP); // dùng pull-up nội để tránh nhiễu
    timer = millis();
  }
  
  void update() { 
    bool nState = digitalRead(pin) == LOW; // LOW = nhấn nếu dùng pull-up
    if (nState != state)
      timer = millis();
    state = nState;
  }
  
  bool isPress() {
    return state;
  }
  
  bool isPressFor(unsigned long mili) { 
    return state && (millis() - timer >= mili);
  }
};

// button test;

// void setup() {
//   Serial.begin(115200); 
//   test.attach(D3); // D3 trên NodeMCU là GPIO0
// }

// void loop() {	
//   test.update();
//   Serial.print("is press?: ");
//   Serial.println(test.isPress());
  
//   Serial.print("is Press for 3 second?: ");
//   Serial.println(test.isPressFor(3000));
  
//   delay(100);
// }
