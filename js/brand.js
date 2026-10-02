(() => {
  "use strict";

  function initializeNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const navigation = document.getElementById("primary-navigation");
    const header = toggle?.closest(".site-header");

    if (!toggle || !navigation || !header) return;

    function closeMenu(returnFocus = false) {
      toggle.setAttribute("aria-expanded", "false");
      header.classList.remove("menu-open");
      if (returnFocus) toggle.focus();
    }

    toggle.removeAttribute("hidden");
    toggle.setAttribute("aria-controls", navigation.id);
    closeMenu();

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      header.classList.toggle("menu-open", open);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) closeMenu();
    });
  }

  function initializeVideo(component) {
    // Preserve the accessible placeholder so clearing an ID restores it.
    const placeholder = document.createDocumentFragment();
    for (const child of component.childNodes) {
      placeholder.append(child.cloneNode(true));
    }

    let renderedId = "";
    let iframe = null;

    function updateVideo() {
      const id = (component.dataset.youtubeId || "").trim();
      const title = component.dataset.title?.trim() || "YouTube video player";

      // Empty or malformed IDs must never create an iframe or a network request.
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
        if (iframe) component.replaceChildren(placeholder.cloneNode(true));
        component.classList.remove("is-ready-video");
        renderedId = "";
        iframe = null;
        return;
      }

      if (iframe && id === renderedId) {
        iframe.title = title;
        return;
      }

      iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}`;
      iframe.title = title;
      iframe.width = "560";
      iframe.height = "315";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      component.replaceChildren(iframe);
      component.classList.add("is-ready-video");
      renderedId = id;
    }

    updateVideo();

    if ("MutationObserver" in window) {
      new MutationObserver(updateVideo).observe(component, {
        attributes: true,
        attributeFilter: ["data-youtube-id", "data-title"],
      });
    }
  }

  function initializeDiagrams() {
    document.querySelectorAll("[data-diagram]").forEach((diagram) => {
      const canvas = diagram.querySelector(".diagram-canvas");
      const buttons = diagram.querySelectorAll("[data-diagram-view]");
      const hint = diagram.querySelector(".diagram-help");

      if (!canvas || !buttons.length) return;

      buttons.forEach((button) => {
        button.hidden = false;
        button.addEventListener("click", () => {
          const detailed = button.dataset.diagramView === "detail";
          diagram.classList.toggle("is-detail", detailed);
          buttons.forEach((control) => {
            control.setAttribute(
              "aria-pressed",
              String(
                control.dataset.diagramView === button.dataset.diagramView,
              ),
            );
          });
          if (hint) {
            hint.textContent = detailed
              ? "Scroll or swipe within the diagram to explore the full-size view."
              : "Use Read labels for a full-size view, or open the diagram description below.";
          }
          canvas.scrollTo({ left: 0, top: 0, behavior: "instant" });
        });
      });
    });
  }

  function initialize() {
    document.documentElement.classList.add("has-js");
    initializeNavigation();
    document.querySelectorAll(".youtube-embed").forEach(initializeVideo);
    initializeDiagrams();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
