# run_worker.py
import time

def main_loop():
    print("WORKER: Iniciado.")
    while True:
        try:
            print(f"[LOG] Ciclo de Scraping inciado")
            
            
            
            time.sleep(600)
            
        except Exception as e:
            print(f"[LOG] Scraping falhou: {e}")
            time.sleep(30)

if __name__ == "__main__":
    main_loop()