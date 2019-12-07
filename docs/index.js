function t(height, str) {
    return `svg { width = auto; height = ${height}; \n ${str} \n }`;
}

document.addEventListener("DOMContentLoaded", () => {
    Crux.use.defaultBioInfoComponents();
})

window.$docsify = {
    name: 'Oviz',
    loadSidebar: true,
    subMaxLevel: 2,
    plugins: [
        function (hook, vm) {
            hook.doneEach(function () {
                var demos = document.getElementsByClassName("demo");
                var editors = [];
                [].forEach.call(demos, function (el) {
                    let template = el.childNodes[0].textContent.replace(/<\/?p>/g, "")
                    if (template[0] === "\n") {
                        template = template.substr(1);
                    }

                    var sib = el.nextElementSibling;
                    var components = {};
                    var data = {};
                    var theme = "light";

                    if (sib && sib.className.indexOf("bvd-code") >= 0) {
                        var extraInfo = eval(sib.textContent.replace(/<\/?p>/g, ""));
                        if (extraInfo.name) components[extraInfo.name] = extraInfo;
                        if (extraInfo.data) data = Object.assign(data, extraInfo.data)
                        if (extraInfo.theme) theme = extraInfo.theme;
                        sib.style.display = "none";
                    }

                    const hasEditor = el.className.indexOf("no-editor") < 0

                    var height = el.dataset.height
                    el.innerHTML = ""

                    var toolbar = document.createElement("div")
                    toolbar.className = "bvd-toolbar"
                    toolbar.appendChild(document.createTextNode("Demo"))

                    var main = document.createElement("div")
                    main.className = "bvd-main"

                    var canvas = document.createElement("div")
                    canvas.className = "bvd-canvas"

                    var editor;
                    if (hasEditor) {
                        // var editor = document.createElement("textarea")
                        // editor.setAttribute("spellcheck", "false")
                        // editor.className = "bvd-editor"
                        // editor.innerHTML = template
                        // main.appendChild(editor)
                        var container = document.createElement("div")
                        container.className = "bvd-editor"
                        main.appendChild(container)
                        editor = CodeMirror(container, {
                            value: template,
                            mode: "bvt",
                            viewportMargin: Infinity,
                            autoCloseBrackets: true,
                        })
                        editor.on("focus", () => {
                            container.classList.toggle("active", true)
                        })
                        editor.on("blur", () => {
                            container.classList.toggle("active", false)
                        })
                        editors.push(editor)
                    }

                    main.appendChild(canvas)
                    el.appendChild(toolbar)
                    el.appendChild(main)

                    if (hasEditor) {
                        var button = document.createElement("div")
                        button.className = "bvd-btn-run"
                        button.innerHTML = "▶"
                        toolbar.appendChild(button)
                        button.onclick = function () {
                            try {
                                Crux.visualize({ el: canvas, template: t(height, editor.getValue()), components: components, data: data, theme })
                            } catch (e) {
                                canvas.innerHTML = `<div class="bvd-error">Error: ${e.message}</div>`;
                            }
                        }
                    }
                    try {
                        Crux.visualize({ el: canvas, template: t(height, template), components: components, data: data, theme })
                    } catch (e) {
                        canvas.innerHTML = `<div class="bvd-error">Error: ${e.message}</div>`;
                    }
                })
                editors.forEach(e => e.refresh())
                window.scrollTo(0, 0)
            })
        }
    ]
}
