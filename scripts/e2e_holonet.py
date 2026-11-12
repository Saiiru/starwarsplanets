"""HOLO-NET browser smoke test. Requires local Playwright + Chromium.

BASE_URL defaults to public GitHub Pages; override for local Vite or static preview.
No user credentials or remote writes are used.
"""
import os
from playwright.sync_api import sync_playwright

BASE_URL = os.getenv("BASE_URL", "https://saiiru.github.io/starwarsplanets/")
CHROMIUM = os.getenv("CHROMIUM_BIN", "/usr/bin/chromium")

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
    for width in (320, 390, 768, 1280, 1440):
        page = browser.new_page(viewport={"width": width, "height": 900}, reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        response = page.goto(BASE_URL, wait_until="domcontentloaded", timeout=35000)
        assert response.status == 200, (width, response.status)
        assert page.get_by_text("FLEET CONTROL.").count() >= 1

        page.get_by_role("button", name="CONSULTA NATURAL").click()
        field = page.get_by_role("textbox", name="O QUE VOCÊ QUER CONSULTAR?")
        page.get_by_role("button", name="EXECUTAR CONSULTA").click()
        answer = page.locator(".answer-panel")
        answer.wait_for(timeout=12000)
        assert "28" in answer.inner_text()
        assert "fictício" in answer.inner_text()
        assert "ESCRITA: BLOQUEADA" in answer.inner_text()

        field.fill("Quem controlava Coruscant nas Guerras Clônicas?")
        page.get_by_role("button", name="EXECUTAR CONSULTA").click()
        assert "República" in answer.inner_text()
        assert answer.get_by_role("link", name="Star Wars Databank (Lucasfilm)").count() == 1

        field.fill("Transfira 8 X-wings para Hoth")
        page.get_by_role("button", name="EXECUTAR CONSULTA").click()
        assert "Ação não permitida" in answer.inner_text()

        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
        assert not errors, (width, errors)
        print("HOLO-NET_QUERY_E2E_PASS", width, "HTTP", response.status, flush=True)

        page.get_by_role("button", name="ATLAS GALÁCTICO").click()
        page.locator(".world-card").first.wait_for(timeout=12000)
        assert page.get_by_text("Coruscant").count() >= 1
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.close()
    browser.close()
