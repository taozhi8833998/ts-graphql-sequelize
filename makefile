-INIT_DIRS := out out/release
-BIN_BABEL := ./node_modules/.bin/babel
PWD := `pwd`

clean:
	@echo 'clean'
	@rm -rf $(-INIT_DIRS)
	@mkdir -p $(-INIT_DIRS)

start:
	npm run dev

install:
	npm install --registry=https://registry.npm.taobao.org

-common-pre: clean

release: -common-pre
	@echo 'make release begin'
	@rsync -av . ./out/release --exclude-from .rsyncignore
	@if [ "${env}" != "default" ] ; \
	then \
		${-BIN_BABEL} out/release/lib -d out/release/lib-dist ; \
		cd ${PWD}/out/release && cp -r lib/schemas/*.graphql lib-dist/schemas/ && rm -rf lib && mv lib-dist lib ; \
	fi
	cp ./out/release/etc/config.${env}.yaml ./out/release/etc/config.yaml
	@echo 'make release done'