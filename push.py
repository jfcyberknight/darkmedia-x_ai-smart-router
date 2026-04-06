import os
import subprocess
import sys

def run_command(command):
    print(f"🚀 Exécution: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Erreur: {result.stderr}")
        return False, result.stderr
    print(result.stdout)
    return True, result.stdout

def main():
    # 1. Git Status
    print("📊 Vérification de l'état Git...")
    ok, status = run_command("git status --short")
    if not ok or not status.strip():
        print("✅ Rien à committer.")
    else:
        # 2. Git Add & Commit
        if len(sys.argv) > 1:
            commit_msg = sys.argv[1]
        else:
            commit_msg = input("📝 Message de commit (Conventional Commits recommandés): ")
            
        if not commit_msg:
            print("⚠️ Message de commit requis.")
            return

        run_command("git add .")
        ok, _ = run_command(f'git commit -m "{commit_msg}"')
        if not ok: return

    # 3. Git Push
    print("📤 Push vers Git...")
    ok, _ = run_command("git push")
    if not ok: return

    # 4. RAG Indexing
    print("🔍 Début de l'indexation RAG...")
    if os.path.exists("index_rag.py"):
        ok, _ = run_command("python index_rag.py")
        if ok:
            print("✨ Workflow terminé: Push + Indexation réussis.")
        else:
            print("❌ Échec de l'indexation RAG.")
    else:
        print("⚠️ Script index_rag.py introuvable. Saut de l'étape d'indexation.")

if __name__ == "__main__":
    main()
